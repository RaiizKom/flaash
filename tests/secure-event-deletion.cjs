// Run: node --test tests/secure-event-deletion.cjs (no network or real data).
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    React: mocks.react,
    require(name) {
      assert.ok(Object.hasOwn(mocks, name), `Unexpected import: ${name}`);
      return mocks[name];
    },
    process: { env: {} },
  }, { filename: file });
  return exports;
}

const denied = "Événement introuvable ou accès refusé.";
for (const scenario of [
  { name: "owner", error: "redirect:/dashboard", steps: ["auth", "ownership", "r2", "sql", "/dashboard"] },
  { name: "different owner", user: "other", error: denied, steps: ["auth", "ownership"] },
  { name: "unauthenticated", user: null, error: "redirect:/login", steps: ["auth", "/login"] },
  { name: "missing event", missing: true, error: denied, steps: ["auth", "ownership"] },
  { name: "lookup error", lookupError: true, error: denied, steps: ["auth", "ownership"] },
  { name: "authentication exception", authThrow: true, error: "auth failed", steps: ["auth"] },
  { name: "lookup exception", lookupThrow: true, error: "lookup failed", steps: ["auth", "ownership"] },
  { name: "R2 failure", r2Error: true, error: "R2 failed", steps: ["auth", "ownership", "r2"] },
  { name: "SQL failure", sqlError: true, error: "La suppression de la soirée n’a pas abouti.", steps: ["auth", "ownership", "r2", "sql"] },
]) {
  test(scenario.name, async () => {
    const calls = [], queries = [], r2Ids = [];
    const user = Object.hasOwn(scenario, "user") ? scenario.user : "owner";
    const supabase = {
      auth: { async getUser() {
        calls.push("auth");
        if (scenario.authThrow) throw new Error("auth failed");
        return { data: { user: user && { id: user } } };
      } },
      from(table) {
        const record = { table, filters: {}, operation: null };
        queries.push(record);
        const query = {
          select(columns) { record.operation = "select"; record.columns = columns; return query; },
          delete() { calls.push("sql"); record.operation = "delete"; return query; },
          eq(key, value) { record.filters[key] = value; return query; },
          async single() {
            calls.push("ownership");
            if (scenario.lookupThrow) throw new Error("lookup failed");
            return {
              data: !scenario.missing && record.filters.owner_id === "owner" ? { id: "event" } : null,
              error: scenario.lookupError ? new Error("lookup failed") : null,
            };
          },
          then(resolve) { resolve({ error: scenario.sqlError ? new Error("private SQL detail") : null }); },
        };
        return query;
      },
    };
    const { deleteEvent } = load("app/dashboard/[id]/actions.ts", {
      "next/cache": {},
      "next/navigation": { redirect(path) { calls.push(path); throw new Error(`redirect:${path}`); } },
      "@/lib/supabase/server": { createClient: async () => supabase },
      stripe: {},
      "@/lib/utils/pricing": {},
      "@/lib/r2": { async deleteEventObjects(id) {
        r2Ids.push(id);
        calls.push("r2");
        if (scenario.r2Error) throw new Error("R2 failed");
      } },
    });
    await assert.rejects(deleteEvent("event"), { name: "Error", message: scenario.error });
    assert.deepEqual(calls, scenario.steps);
    for (const query of queries) {
      assert.equal(query.table, "events");
      assert.deepEqual(query.filters, { id: "event", owner_id: user });
      assert.ok(["select", "delete"].includes(query.operation));
      if (query.operation === "select") assert.equal(query.columns, "id");
    }
    assert.equal(queries.length, calls.includes("sql") ? 2 : calls.includes("ownership") ? 1 : 0);
    assert.deepEqual(r2Ids, calls.includes("r2") ? ["event"] : []);
  });
}

for (const failure of [false, "list", "delete", "partial"]) {
  test(`R2 cleanup: ${failure || "two populated pages"}`, async () => {
    const commands = [];
    class Command { constructor(input) { this.input = input; } }
    class List extends Command {}
    class Delete extends Command {}
    const { deleteEventObjects } = load("lib/r2.ts", {
      "@aws-sdk/client-s3": {
        S3Client: class { async send(command) {
          commands.push(command);
          if (command instanceof List) {
            if (failure === "list") throw new Error("list failed");
            return command.input.ContinuationToken
              ? { Contents: [{ Key: "events/event/second" }] }
              : { Contents: [{ Key: "events/event/first" }], NextContinuationToken: "next" };
          }
          if (failure === "delete") throw new Error("delete failed");
          return failure === "partial" ? { Errors: [{ Code: "AccessDenied" }] } : {};
        } },
        ListObjectsV2Command: List,
        DeleteObjectsCommand: Delete,
        PutObjectCommand: Command,
        DeleteObjectCommand: Command,
      },
    });
    if (failure) await assert.rejects(deleteEventObjects("event"), {
      name: "Error", message: failure === "partial" ? "R2 event cleanup failed." : `${failure} failed`,
    });
    else await deleteEventObjects("event");
    assert.equal(commands.length, failure === "list" ? 1 : failure ? 2 : 4);
    for (const command of commands) {
      assert.ok(command instanceof List || command instanceof Delete);
      if (command instanceof List) assert.equal(command.input.Prefix, "events/event/");
      else {
        assert.equal(command.input.Delete.Quiet, true);
        assert.equal(command.input.Delete.Objects.length, 1);
      }
    }
    if (!failure) {
      assert.equal(commands[2].input.ContinuationToken, "next");
      assert.equal(commands[1].input.Delete.Objects[0].Key, "events/event/first");
      assert.equal(commands[3].input.Delete.Objects[0].Key, "events/event/second");
    }
  });
}

// Execute the real component with a tiny hook renderer; no DOM or server call.
for (const outcome of ["failure", "redirect", "success"]) {
  test(`delete button: ${outcome} and retry`, async () => {
    const values = [];
    let cursor = 0;
    let fail = outcome === "failure";
    const { getRedirectError, isRedirectError } = require("next/dist/client/components/redirect");
    const redirectError = getRedirectError("/dashboard", "push", 303);
    const { default: Button } = load("app/dashboard/[id]/DeleteButton.tsx", {
      react: {
        useState(initial) {
          const index = cursor++;
          if (!(index in values)) values[index] = initial;
          return [values[index], (value) => { values[index] = value; }];
        },
        createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
      },
      "next/dist/client/components/redirect": { isRedirectError },
      "./actions": { async deleteEvent() {
        if (fail) throw new Error("sensitive backend detail");
        if (outcome === "redirect") throw redirectError;
      } },
    });
    function render() { cursor = 0; return Button({ eventId: "event" }); }
    function nodes(node) {
      if (!node || typeof node !== "object") return [];
      return [node, ...node.children.flatMap(nodes)];
    }
    nodes(render()).find((n) => n.type === "button").props.onClick();
    const confirm = () => nodes(render()).filter((n) => n.type === "button").at(-1);
    const pending = confirm().props.onClick();
    assert.equal(confirm().props.disabled, true);
    if (outcome === "redirect") await assert.rejects(pending, (error) => error === redirectError);
    else await pending;
    assert.equal(confirm().props.disabled, false);
    const alerts = nodes(render()).filter((n) => n.props.role === "alert");
    assert.equal(alerts.length, outcome === "failure" ? 1 : 0);
    if (fail) {
      assert.equal(alerts[0].children.join(""), "La suppression n’a pas abouti. Réessayez dans un instant.");
      fail = false;
      await confirm().props.onClick();
      assert.equal(nodes(render()).filter((n) => n.props.role === "alert").length, 0);
    }
  });
}
