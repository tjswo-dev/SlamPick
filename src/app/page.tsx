"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0px",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "48px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "clamp(48px, 10vw, 96px)",
            fontWeight: "900",
            color: "#fff",
            letterSpacing: "-0.04em",
            lineHeight: "1",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          SLAM PICK
        </h1>
        <div
          style={{
            width: "100%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #fff, transparent)",
            marginTop: "16px",
          }}
        />
      </div>

      {/* Login Button */}
      <button
        onClick={() => router.push("/dashboard")}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#fff",
          padding: "14px 48px",
          fontSize: "14px",
          fontWeight: "500",
          letterSpacing: "0.15em",
          cursor: "pointer",
          transition: "all 0.2s ease",
          textTransform: "uppercase",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.color = "#000";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#fff";
        }}
      >
        Log In
      </button>

      {/* Bottom tag */}
      <p
        style={{
          position: "fixed",
          bottom: "32px",
          color: "rgba(255,255,255,0.15)",
          fontSize: "11px",
          letterSpacing: "0.1em",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        INFLUENCER SLOT MATCHING PLATFORM
      </p>
    </main>
  );
}
