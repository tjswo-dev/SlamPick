"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      setLoading(false);
      return;
    }

    // public.users 테이블에 row 생성 (없으면 insert, 있으면 무시)
    if (data.user) {
      await supabase.from("users").upsert({
        id: data.user.id,
        email: data.user.email ?? email,
      }, { onConflict: "id" });
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
        padding: "24px",
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

      {/* Signup form */}
      <form
        onSubmit={handleSignup}
        style={{
          width: "100%",
          maxWidth: "360px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
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
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
          {loading ? "처리 중..." : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
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
          이미 계정이 있으신가요? 로그인
        </button>
      </form>

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
