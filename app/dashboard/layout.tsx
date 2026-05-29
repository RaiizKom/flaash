import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) console.error("[dashboard/layout] getUser error:", error.message);
    user = data.user;
  } catch (err) {
    console.error("[dashboard/layout] createClient THREW:", err);
    throw err;
  }

  if (!user) redirect("/login");

  return (
    <div className="flaash-shell flex flex-col min-h-dvh">
      {/* Top nav */}
      <nav
        style={{
          height: 56,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 28,
            fontStyle: "italic",
            letterSpacing: "-0.03em",
            color: "var(--flaash-ink)",
            textDecoration: "none",
          }}
        >
          Flaash
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/dashboard/new"
            className="btn-pill btn-amber"
            style={{ padding: "12px 20px", fontSize: 13, width: "auto" }}
          >
            + CRÉER
          </Link>
          <form action={logout}>
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--fg-3)",
                padding: "8px 4px",
              }}
            >
              Déconnexion
            </button>
          </form>
        </div>
      </nav>

      <main className="flex flex-col flex-1">{children}</main>
    </div>
  );
}
