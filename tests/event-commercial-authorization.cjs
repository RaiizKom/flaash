// Run with node --test tests/event-commercial-authorization.cjs. All external services are mocked.
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks = {}, env = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, {
    exports,
    process: { env },
    console: { log() {}, error() {}, warn() {} },
    require(name) {
      assert.ok(Object.hasOwn(mocks, name), `Unexpected import: ${name}`);
      return mocks[name];
    },
  }, { filename: file });
  return exports;
}

const pricing = load("lib/utils/pricing.ts");
const event = { id: "event", owner_id: "owner", slug: "soiree", title: "Soirée", status: "active" };
const noRow = { data: null, error: null };
const dbError = { data: null, error: { message: "private DB detail" } };

function setup({ user = { id: "owner", email: "owner@example.test" }, session = [], admin = [] } = {}) {
  const queries = [], paths = [], emails = [];
  function client(role, responses) {
    return {
      auth: { async getUser() { return { data: { user } }; } },
      from(table) {
        const query = { role, table, filters: {} };
        queries.push(query);
        function finish() {
          assert.ok(responses.length, `Unexpected ${role} query on ${table}`);
          return Promise.resolve(responses.shift());
        }
        const builder = {
          select(columns) { query.columns = columns; return builder; },
          insert(values) { query.values = { ...values }; return builder; },
          update(values) { query.values = { ...values }; return builder; },
          eq(key, value) { query.filters[key] = value; return builder; },
          lte(key, value) { query.filters[key + ".lte"] = value; return builder; },
          order() { return builder; },
          limit: finish,
          single: finish,
          maybeSingle: finish,
          then(resolve, reject) { return finish().then(resolve, reject); },
        };
        return builder;
      },
    };
  }
  const adminClient = client("admin", admin);
  adminClient.auth.admin = { async getUserById() { return { data: { user } }; } };
  const mocks = {
    "@/lib/supabase/server": { createClient: async () => client("session", session) },
    "@/lib/supabase/admin": { createAdminClient(...args) {
      assert.equal(args.length, 0);
      return adminClient;
    } },
    "@/lib/utils/pricing": pricing,
    "@/lib/utils/slug": { generateSlug: () => "soiree" },
    "@/lib/email/transactional": { async sendOrganizerEventReadyEmail(email) { emails.push(email); } },
    "@/lib/r2": {},
    "next/cache": { revalidatePath(path) { paths.push(path); } },
    "next/navigation": { redirect(path) { throw new Error(`redirect:${path}`); } },
    stripe: {},
  };
  return { mocks, queries, paths, emails };
}

function form(fields = {}) {
  const result = new FormData();
  for (const [key, value] of Object.entries({
    title: "Soirée", event_type: "party", plan_id: "essential", max_guests: "50",
    photos_per_guest: "20", reveal_mode: "manual", ...fields,
  })) {
    if (value !== null) result.set(key, value);
  }
  return result;
}

for (const [plan, limit, price] of [
  ["test", 3, 0], ["essential", 50, 59], ["classic", 120, 99], ["premium", 250, 149],
]) {
  test(`create ${plan}: accepts its ceiling and rejects excess capacity`, async () => {
    const { mocks, queries, emails } = setup({ admin: [noRow, { data: event }] });
    const { createEvent } = load("app/dashboard/new/actions.ts", mocks);
    const isTest = plan === "test";
    const result = await createEvent(form({
      plan_id: plan, max_guests: limit, photos_per_guest: isTest ? 1 : 19,
      owner_id: "other", price_chf: "0", status: "revealed", stripe_payment_id: "untrusted",
    }));
    assert.equal(result.eventId, "event");
    assert.equal(result.requiresPayment, !isTest);
    assert.deepEqual(queries[1].values, {
      owner_id: "owner", title: "Soirée", event_type: "party", slug: "soiree",
      status: isTest ? "active" : "draft", max_guests: limit, photos_per_guest: isTest ? 20 : 19,
      reveal_at: null, allow_library_upload: false, price_chf: price, plan_id: plan,
    });
    assert.deepEqual(queries.map(({ role }) => role), ["admin", "admin"]);
    assert.equal(emails.length, isTest ? 1 : 0);
    assert.ok((await createEvent(form({ plan_id: plan, max_guests: limit + 1 }))).error);
    assert.equal(queries.length, 2);
  });
}

test("create rejects invalid numerical entries before any query", async () => {
  const { mocks, queries } = setup();
  const { createEvent } = load("app/dashboard/new/actions.ts", mocks);
  for (const key of ["max_guests", "photos_per_guest"]) {
    for (const value of [null, "", "0", "-1", "+1", "01", " 1", "1\n", "1.0", "1e1", "0x10", "1 guest", "9007199254740993", new Blob(["1"])]) {
      assert.ok((await createEvent(form({ [key]: value }))).error, `${key}: ${value}`);
    }
  }
  assert.ok((await createEvent(form({ photos_per_guest: "21" }))).error);
  assert.equal(queries.length, 0);
});

test("create requires authentication and handles lookup, insert, and missing-row errors", async () => {
  const { mocks, queries } = setup({ user: null });
  await assert.rejects(load("app/dashboard/new/actions.ts", mocks).createEvent(form()), /redirect:\/login/);
  assert.equal(queries.length, 0);
  for (const admin of [[dbError], [noRow, dbError], [noRow, noRow]]) {
    const { mocks, emails } = setup({ admin });
    const result = await load("app/dashboard/new/actions.ts", mocks).createEvent(form({ plan_id: "test", max_guests: 3 }));
    assert.equal(result.error, "Impossible de créer la soirée.");
    assert.equal(emails.length, 0);
  }
});

test("settings check ownership, whitelist columns, and protect against a concurrent status change", async () => {
  for (const outcome of [{ data: { id: "event" } }, dbError, noRow]) {
    const { mocks, queries, paths } = setup({
      session: [{ data: event }, { data: [{ photos_taken: 8 }] }],
      admin: [outcome],
    });
    const { updateEventSettings } = load("app/dashboard/[id]/settings/actions.ts", mocks);
    const result = await updateEventSettings("event", form({
      photos_per_guest: 8, max_guests: 999, owner_id: "other", status: "revealed", plan_id: "test",
    }));
    assert.equal(result.success, outcome.data ? true : undefined);
    assert.equal(Boolean(result.error), !outcome.data);
    assert.equal(paths.length, outcome.data ? 3 : 0);
    assert.deepEqual(queries[0].filters, { id: "event", owner_id: "owner" });
    assert.deepEqual(queries[2], {
      role: "admin", table: "events", filters: { id: "event", owner_id: "owner", status: "active" },
      values: { title: "Soirée", event_type: "party", allow_library_upload: false, reveal_at: null, photos_per_guest: 8 },
      columns: "id",
    });
  }
});

test("settings refuse another owner, unreadable counts, and reductions below used poses", async () => {
  for (const [user, session] of [
    [{ id: "other" }, [noRow]],
    [{ id: "owner" }, [{ data: event }, dbError]],
    [{ id: "owner" }, [{ data: event }, { data: [{ photos_taken: 9 }] }]],
  ]) {
    const { mocks, queries } = setup({ user, session });
    const { updateEventSettings } = load("app/dashboard/[id]/settings/actions.ts", mocks);
    assert.ok((await updateEventSettings("event", form({ photos_per_guest: 8 }))).error);
    assert.equal(queries[0].filters.owner_id, user.id);
    assert.ok(queries.every(({ role }) => role === "session"));
  }
});

test("revealed event settings still allow title changes with quota and date locked", async () => {
  const { mocks, queries } = setup({
    session: [{ data: { ...event, status: "revealed" } }], admin: [{ data: { id: "event" } }],
  });
  const { updateEventSettings } = load("app/dashboard/[id]/settings/actions.ts", mocks);
  assert.equal((await updateEventSettings("event", form())).success, true);
  assert.deepEqual(queries[1].values, { title: "Soirée", event_type: "party", allow_library_upload: false });
});

for (const [action, originalStatus, targetStatus, validPaths] of [
  ["revealNow", "active", "revealed", 3],
  ["activateEvent", "draft", "active", 2],
]) {
  test(`${action} constrains the privileged write and handles denied or failed transitions`, async () => {
    for (const outcome of [{ data: event }, noRow, dbError]) {
      const { mocks, queries, paths } = setup({ admin: [outcome] });
      const actions = load("app/dashboard/[id]/actions.ts", mocks, { NODE_ENV: "development" });
      if (outcome.data) await actions[action]("event");
      else await assert.rejects(actions[action]("event"), outcome.error ? /Impossible/ : /introuvable/);
      assert.equal(queries[0].role, "admin");
      assert.deepEqual(queries[0].filters, { id: "event", owner_id: "owner", status: originalStatus });
      assert.equal(queries[0].values.status, targetStatus);
      assert.equal(paths.length, outcome.data ? validPaths : 0);
    }
  });
}

test("development activation is rejected before querying in production", async () => {
  const { mocks, queries } = setup();
  const { activateEvent } = load("app/dashboard/[id]/actions.ts", mocks, { NODE_ENV: "production" });
  await assert.rejects(activateEvent("event"), /réservée au développement/);
  assert.equal(queries.length, 0);
});

test("dashboard opens the gallery only after a committed scheduled reveal", async () => {
  const due = { ...event, reveal_at: "2000-01-01T00:00:00.000Z" };
  const revealed = { ...due, status: "revealed" };
  for (const [outcome, current, opens] of [
    [{ data: revealed }, null, true],
    [dbError, null, false],
    [noRow, { ...due, reveal_at: null }, false],
    [noRow, revealed, true],
  ]) {
    const session = [{ data: due }];
    if (current) session.push({ data: current });
    session.push({ count: 1 }, { count: 1 });
    const { mocks, queries } = setup({ session, admin: [outcome] });
    const element = (type, props) => ({ type, props });
    Object.assign(mocks, {
      "react/jsx-runtime": { jsx: element, jsxs: element },
      react: {},
      "next/link": "link",
      "@/types": { STATUS_LABELS: {}, EVENT_TYPE_LABELS: {} },
      "./QRCodeCard": {}, "./actions": {}, "./DeleteButton": {}, "./PaymentBanner": {}, "./CoverUploadCard": {},
    });
    const { default: Page } = load("app/dashboard/[id]/page.tsx", mocks);
    const page = await Page({ params: { id: "event" } });
    assert.equal(JSON.stringify(page).includes("/api/download/soiree"), opens);
    assert.equal(queries[1].role, "admin");
    const { "reveal_at.lte": deadline, ...filters } = queries[1].filters;
    assert.ok(Date.parse(deadline) >= Date.parse(due.reveal_at));
    assert.deepEqual(filters, { id: "event", owner_id: "owner", status: "active" });
    assert.deepEqual(queries[1].values, { status: "revealed" });
    if (current) assert.deepEqual(queries[2].filters, { id: "event", owner_id: "owner" });
  }
});

test("Stripe activates a draft once and handles stale state and DB errors", async () => {
  for (const [initialState, outcome, status, emailCount] of [
    ["draft", { data: event }, 200, 1], ["draft", noRow, 200, 0],
    ["draft", dbError, 500, 0], ["revealed", null, 200, 0],
  ]) {
    const admin = [{ data: { ...event, status: initialState } }];
    if (outcome) admin.push(outcome);
    const { mocks, queries, emails } = setup({ admin });
    mocks.stripe = class {
      webhooks = { constructEvent: () => ({
        type: "checkout.session.completed",
        data: { object: { id: "checkout", metadata: { event_id: "event" } } },
      }) };
    };
    mocks["next/server"] = { NextResponse: { json: (data, options) => ({ data, status: options?.status ?? 200 }) } };
    const { POST } = load("app/api/webhooks/stripe/route.ts", mocks, { STRIPE_WEBHOOK_SECRET: "mock" });
    const response = await POST({ text: async () => "", headers: { get: () => "mock" } });
    assert.equal(response.status, status);
    assert.equal(emails.length, emailCount);
    if (outcome) {
      assert.deepEqual(queries[1].filters, { id: "event", status: "draft" });
      assert.deepEqual(queries[1].values, { status: "active", stripe_payment_id: "checkout" });
    } else {
      assert.equal(queries.length, 1);
    }
  }
});
