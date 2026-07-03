import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--flaash-ink)",
      }}
    >
      <div style={{ height: 6, background: "var(--flaash-amber)" }} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div
          className="f-display"
          style={{
            fontSize: "clamp(96px, 28vw, 160px)",
            color: "var(--flaash-amber)",
            lineHeight: 1,
            marginBottom: 0,
          }}
        >
          4<em>0</em>4
        </div>

        <p
          className="f-script"
          style={{
            color: "rgba(250,247,242,0.55)",
            fontSize: 22,
            marginTop: 8,
            marginBottom: 32,
          }}
        >
          cette page n&apos;est plus dans la pellicule —
        </p>

        <p
          style={{
            color: "rgba(250,247,242,0.7)",
            fontSize: 15,
            maxWidth: 280,
            lineHeight: 1.6,
            marginBottom: 40,
          }}
        >
          Le lien est peut-être expiré ou vous avez suivi une mauvaise adresse.
        </p>

        <Link href="/" className="btn-pill btn-amber" style={{ maxWidth: 280 }}>
          Revenir à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
