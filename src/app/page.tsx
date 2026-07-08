"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface ServiceTier {
  level: string;
  badge: string;
  features: string[];
  effect: string;
}

interface ServiceData {
  id: string;
  tag: string;
  title: string;
  titleEn: string;
  summary: string;
  detail: {
    description: string;
    points: { label: string; value: string }[];
    effect: string;
    tiers?: ServiceTier[];
    videoUrl?: string;
  };
}

const SERVICES: ServiceData[] = [
  {
    id: "visit",
    tag: "01",
    title: "방문형 콘텐츠",
    titleEn: "Location-Based Content",
    summary: "오프라인 현장에 크리에이터가 직접 방문하여 브랜드의 생생한 경험을 콘텐츠로 제작·전달합니다.",
    detail: {
      description:
        "축제, 약국, 병의원 등 오프라인 거점에 크리에이터가 직접 방문하여 제품과 브랜드에 대한 생생한 현장 경험을 콘텐츠로 제작하고 전달하는 서비스입니다. 단순 광고가 아닌 실제 경험에서 우러나오는 진정성 있는 콘텐츠로 소비자의 신뢰를 얻습니다.",
      points: [
        { label: "주요 거점", value: "축제 · 약국 · 병의원" },
        { label: "운영 방식", value: "크리에이터 현장 직접 방문" },
        { label: "콘텐츠 형태", value: "브이로그 · 리뷰 · 체험 콘텐츠" },
      ],
      effect:
        "브랜드에 대한 자연스러운 호기심을 자극하여 광고에 대한 피로감 없이 자발적인 인바운드 고객을 증대시킵니다.",
      videoUrl: undefined,
    },
  },
  {
    id: "seeding",
    tag: "02",
    title: "시딩형 콘텐츠",
    titleEn: "Tiered Influencer Seeding",
    summary: "브랜드 성장 단계에 맞춰 나노·미들·메가급으로 세분화한 맞춤형 콘텐츠 전략을 설계합니다.",
    detail: {
      description:
        "브랜드의 성장 단계와 마케팅 목적에 맞추어 라이징 나노급, 미들급, 메가급으로 세분화하여 최적의 크리에이터 조합을 설계합니다. 단계별 전략으로 비용 효율성을 극대화하고 목표 달성 속도를 높입니다.",
      points: [],
      effect:
        "단계별 타겟팅을 통해 브랜드 인지도를 체계적으로 쌓고 전환율을 극대화합니다.",
      tiers: [
        {
          level: "나노급",
          badge: "RISING NANO",
          features: [
            "초기 브랜드 콘텐츠 자산 및 인지도 구축",
            "신규 국가 진출 시 필수적인 기본 베이스 확보",
          ],
          effect:
            "수개월간 꾸준히 진행 시, 퀄리티 높고 신박한 박처럼 느껴지는 자연스러운 오가닉 추천을 통해 소비 전환 유도",
        },
        {
          level: "미들급",
          badge: "MIDDLE",
          features: ["준비 중 — 콘텐츠가 곧 추가됩니다"],
          effect: "준비 중",
        },
        {
          level: "메가급",
          badge: "MEGA",
          features: ["준비 중 — 콘텐츠가 곧 추가됩니다"],
          effect: "준비 중",
        },
      ],
      videoUrl: undefined,
    },
  },
  {
    id: "trust",
    tag: "03",
    title: "신뢰형 콘텐츠",
    titleEn: "Expert Authority Content",
    summary: "약사·의사·전문 기관 등 공신력 있는 전문가가 팩트 기반 정보를 전달하여 소비자에게 절대적 신뢰를 구축합니다.",
    detail: {
      description:
        "약국, 약사, 병의원 등 전문가 및 전문 기관 채널을 통해 제품에 대한 팩트 기반 정보를 전달하는 서비스입니다. 일반 광고와 달리 전문가의 공신력을 바탕으로 소비자에게 높은 신뢰도를 형성하며, 건강·뷰티·의약 관련 브랜드에 특히 효과적입니다.",
      points: [
        { label: "주요 대상", value: "약국 · 약사 · 병의원 · 전문 기관" },
        { label: "콘텐츠 방식", value: "팩트 기반 정보 전달 · 전문가 리뷰" },
        { label: "적합 카테고리", value: "건강기능식품 · 뷰티 · 의약외품" },
      ],
      effect:
        "전문가의 공신력을 활용해 소비자의 구매 결정 장벽을 낮추고, 브랜드에 대한 절대적 신뢰도를 구축하여 재구매율과 브랜드 충성도를 높입니다.",
      videoUrl: undefined,
    },
  },
  {
    id: "organic",
    tag: "04",
    title: "오가닉 추천 콘텐츠",
    titleEn: "Organic Curation Content",
    summary: "여러 카테고리의 제품을 자연스럽게 큐레이션하여 광고 거부감 없이 소비자의 자발적 구매를 이끌어냅니다.",
    detail: {
      description:
        "단일 제품만 강조하는 것이 아니라, 여러 카테고리의 다양한 제품들을 하나의 콘텐츠에 자연스럽게 묶어서 큐레이션하는 서비스입니다. 소비자 입장에서는 광고처럼 느껴지지 않아 거부감이 낮고, 자발적인 추천처럼 인식되어 구매 전환율이 높습니다.",
      points: [
        { label: "운영 방식", value: "멀티 카테고리 큐레이션 콘텐츠" },
        { label: "핵심 전략", value: "광고 거부감 최소화 · 자연스러운 노출" },
        { label: "콘텐츠 형태", value: "추천 리스트 · 하울 · 일상 브이로그" },
      ],
      effect:
        "광고로 느껴지지 않는 자연스러운 노출로 소비자의 거부감을 낮추고, 오가닉 추천 형태로 소비 전환을 유도하여 장기적인 브랜드 인지도를 누적합니다.",
      videoUrl: undefined,
    },
  },
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const servicesRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("이메일 인증이 필요합니다. 가입 시 받은 확인 메일을 확인해주세요.");
      } else if (error.message.includes("Invalid login credentials")) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }
    router.push(data.user?.email === "admin@slam-global.com" ? "/admin" : "/dashboard");
  };

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50%       { transform: translateY(7px) translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes expandDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::placeholder { color: rgba(255,255,255,0.25); }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          minHeight: "100vh",
          backgroundColor: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
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

        {/* Bar + glow */}
        <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
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
          <div
            style={{
              position: "absolute",
              top: "18px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100vw",
              height: expanded ? "55vh" : "0",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 40%, transparent 100%)",
              transition: "height 1.4s ease 0.15s",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Login area */}
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
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
            >
              Log In
            </button>
          ) : (
            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "fadeSlideIn 0.6s ease 0.5s both" }}
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
              {error && <p style={{ fontSize: "13px", color: "#f87171", textAlign: "center" }}>{error}</p>}
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
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
              >
                {loading ? "로그인 중..." : "Log In"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/signup")}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: "13px", cursor: "pointer", padding: "8px", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
              >
                계정이 없으신가요? 회원가입
              </button>
            </form>
          )}
        </div>

        {/* 서비스 소개 ↓ — bottom of hero */}
        <button
          onClick={scrollToServices}
          style={{
            position: "absolute",
            bottom: "44px",
            left: "50%",
            transform: "translateX(-50%)",
            animation: "bounce 2.4s ease-in-out infinite",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "7px",
            padding: "8px 20px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget.querySelector(".svc-label") as HTMLElement).style.color = "rgba(255,255,255,0.9)";
            (e.currentTarget.querySelector(".svc-arrow") as HTMLElement).style.color = "rgba(255,255,255,0.9)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget.querySelector(".svc-label") as HTMLElement).style.color = "rgba(255,255,255,0.35)";
            (e.currentTarget.querySelector(".svc-arrow") as HTMLElement).style.color = "rgba(255,255,255,0.35)";
          }}
        >
          <span className="svc-label" style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", transition: "color 0.2s", textTransform: "uppercase" }}>
            서비스 소개
          </span>
          <span className="svc-arrow" style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", transition: "color 0.2s", lineHeight: 1 }}>
            ↓
          </span>
        </button>
      </section>

      {/* ── GRADIENT TRANSITION ── */}
      <div
        ref={servicesRef}
        style={{
          height: "360px",
          background: "linear-gradient(to bottom, #000000 0%, #050505 12%, #0d0d0d 25%, #1a1a1a 40%, #3a3a3a 58%, #888888 75%, #d4d4d4 90%, #f2f2f2 100%)",
          flexShrink: 0,
        }}
      />

      {/* ── SERVICES SECTION ── */}
      <section style={{ backgroundColor: "#f9f9f9" }}>
        {/* Heading */}
        <div style={{ padding: "80px 64px 0", maxWidth: "1400px", margin: "0 auto" }}>
          <p style={{ fontSize: "10px", fontWeight: "700", color: "#bbb", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "16px" }}>
            Service Portfolio
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: "40px", borderBottom: "1px solid #e0e0e0" }}>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: "900", color: "#111", letterSpacing: "-0.04em", lineHeight: 1 }}>
              슬램의 서비스
            </h2>
            <p style={{ fontSize: "13px", color: "#999", lineHeight: 1.8, textAlign: "right", maxWidth: "260px" }}>
              브랜드의 성장 목표에 맞는<br />최적의 마케팅 솔루션을 제공합니다.
            </p>
          </div>
        </div>

        {/* Editorial rows */}
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {SERVICES.map((service, i) => {
            const textLeft = i % 2 === 0;
            return (
              <div
                key={service.id}
                style={{
                  display: "flex",
                  minHeight: "520px",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                {/* Text column */}
                <div
                  style={{
                    order: textLeft ? 1 : 2,
                    flex: "0 0 40%",
                    padding: "72px 64px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <p style={{ fontSize: "10px", fontWeight: "700", color: "#ccc", letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: "24px" }}>
                    {service.tag}
                  </p>
                  <h3 style={{ fontSize: "clamp(30px, 3.2vw, 46px)", fontWeight: "900", color: "#111", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "22px" }}>
                    {service.title}
                  </h3>
                  <p style={{ fontSize: "10px", fontWeight: "600", color: "#bbb", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "28px" }}>
                    {service.titleEn}
                  </p>
                  <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.9, marginBottom: "36px", maxWidth: "340px" }}>
                    {service.summary}
                  </p>
                  {service.detail.points.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "40px" }}>
                      {service.detail.points.map((pt, j) => (
                        <span key={j} style={{ fontSize: "11px", border: "1px solid #ddd", color: "#555", padding: "5px 13px", borderRadius: "20px", fontWeight: "500" }}>
                          {pt.value}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "28px", height: "1px", backgroundColor: "#111", display: "block" }} />
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#111", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                      자세히 보기
                    </span>
                  </div>
                </div>

                {/* Visual column */}
                <div
                  style={{
                    order: textLeft ? 2 : 1,
                    flex: 1,
                    backgroundColor: "#111",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Watermark number */}
                  <span style={{
                    position: "absolute",
                    fontSize: "clamp(180px, 22vw, 320px)",
                    fontWeight: "900",
                    color: "rgba(255,255,255,0.03)",
                    letterSpacing: "-0.06em",
                    lineHeight: 1,
                    userSelect: "none",
                    right: "-20px",
                    bottom: "-30px",
                  }}>
                    {service.tag}
                  </span>
                  {/* Center content */}
                  <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "40px" }}>
                    <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.2)", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "20px" }}>
                      {service.titleEn}
                    </p>
                    <div style={{ width: "40px", height: "1px", backgroundColor: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.8, maxWidth: "280px" }}>
                      {service.detail.effect}
                    </p>
                  </div>
                  {/* Subtle gradient overlay */}
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${textLeft ? "20% 40%" : "80% 40%"}, rgba(255,255,255,0.04) 0%, transparent 60%)`, pointerEvents: "none" }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#f2f2f2",
          borderTop: "1px solid #e5e7eb",
          padding: "32px 40px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#bbb", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Influencer Slot Matching Platform
        </p>
      </footer>

    </>
  );
}

function SectionLabel({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p style={{ fontSize: "10px", color: dark ? "rgba(255,255,255,0.35)" : "#aaa", fontWeight: "700", letterSpacing: "0.18em", textTransform: "uppercase" }}>
      {children}
    </p>
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
