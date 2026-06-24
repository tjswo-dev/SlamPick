"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center" }}>
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
      </div>

      {/* Bar + downward glow */}
      <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
        {/* Bar — expands horizontally */}
        <div
          style={{
            marginTop: "16px",
            width: expanded ? "100vw" : "clamp(280px, 45vw, 460px)",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #fff, transparent)",
            transition: "width 0.9s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.9s ease",
            boxShadow: expanded
              ? "0 0 12px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.7), 0 0 100px rgba(255,255,255,0.25)"
              : "none",
          }}
        />

        {/* Glow spreading downward */}
        <div
          style={{
            position: "absolute",
            top: "18px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100vw",
            height: expanded ? "55vh" : "0",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 40%, transparent 100%)",
            transition: "height 1.4s ease 0.15s",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Button → Form */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "360px",
          padding: "0 24px",
          marginTop: "48px",
        }}
      >
        {!expanded ? (
          <button
            onClick={() => setExpanded(true)}
            style={{
              width: "100%",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              padding: "14px",
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
        ) : (
          <form
            onSubmit={handleLogin}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              animation: "fadeSlideIn 0.6s ease 0.5s both",
            }}
          >
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
            />

            {error && (
              <p style={{ fontSize: "13px", color: "#f87171", textAlign: "center" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "4px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                padding: "14px",
                fontSize: "14px",
                fontWeight: "500",
                letterSpacing: "0.15em",
                cursor: loading ? "default" : "pointer",
                transition: "all 0.2s ease",
                textTransform: "uppercase",
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#000";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#fff";
              }}
            >
              {loading ? "로그인 중..." : "Log In"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/signup")}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.35)",
                fontSize: "13px",
                cursor: "pointer",
                padding: "8px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              계정이 없으신가요? 회원가입
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

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

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  padding: "13px 16px",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  borderRadius: "2px",
};
