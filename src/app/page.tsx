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
    summary: "축제, 약국, 병의원 등 오프라인 현장에 직접 방문하여 제품과 브랜드에 대한 생생한 경험을 콘텐츠로 제작·전달합니다.",
    detail: {
      description:
        "오프라인 현장에 직접 방문하여 제품과 브랜드의 생생한 경험을 콘텐츠로 제작·전달합니다. 정보 저장, 가볼만한 장소, '가서 이거 사야지' 같은 자연스러운 소비 욕구를 자극하여 자발적인 인바운드 고객을 증대시킵니다.",
      points: [
        { label: "주요 거점", value: "축제 · 약국 · 병의원" },
        { label: "운영 방식", value: "오프라인 현장에 직접 방문하여 제품과 브랜드에 대한 생생한 경험을 콘텐츠로 제작 및 전달" },
        { label: "콘텐츠 형태", value: "정보 저장 · 가볼만한 장소 · 체험 리뷰" },
      ],
      effect:
        "브랜드에 대한 호기심을 자극하여 자발적인 인바운드 고객 증대 — 정보 저장, 가볼만한 장소, '가서 이거 사야지' 하는 콘텐츠",
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
            "수개월간 꾸준히 진행 시, 퀄리티 높고 신박한 바이럴 콘텐츠가 터지며 브랜드 효자 제품으로 견인",
        },
        {
          level: "미들급",
          badge: "MIDDLE",
          features: [
            "메가급보다 더 탄탄하고 밀도 높은 팬층 보유",
            "강한 팔로워십과 활발한 소통",
          ],
          effect:
            "브랜드의 2차 마케팅 활용 소재로 사용하기에 가장 적합한 고효율 그룹",
        },
        {
          level: "메가급",
          badge: "MEGA",
          features: [
            "압도적인 대중적 인지도와 강한 팔로워십 보유",
            "엄청난 도달률과 노출량 보장",
          ],
          effect:
            "메가 크리에이터가 가진 강력한 이미지를 브랜드 이미지로 융합시켜 가치 격상",
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
        { label: "운영 방식", value: "전문성이 돋보이는 주체와 브랜드를 결합하여 팩트 기반의 정보 제공" },
        { label: "적합 카테고리", value: "건강기능식품 · 뷰티 · 의약외품" },
      ],
      effect:
        "제품의 효능과 브랜드에 대한 소비자의 절대적인 신뢰도 확보",
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
        { label: "운영 방식", value: "여러 카테고리의 다양한 제품들을 하나의 콘텐츠에 자연스럽게 묶어서 큐레이션" },
        { label: "핵심 전략", value: "광고 거부감 최소화 · 자연스러운 노출" },
        { label: "콘텐츠 형태", value: "추천 리스트 · 하울 · 일상 브이로그" },
      ],
      effect:
        "광고에 대한 거부감을 낮추고, 찐 후기처럼 느껴지는 자연스러운(오가닉) 추천을 통해 소비 전환 유도",
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
  const [activeId, setActiveId] = useState<string | null>(null);

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
      <section style={{ backgroundColor: "#f2f2f2", padding: "72px 40px 120px" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", letterSpacing: "0.22em", marginBottom: "14px", textTransform: "uppercase" }}>
            Service Portfolio
          </p>
          <h2
            style={{
              fontSize: "clamp(34px, 5vw, 58px)",
              fontWeight: "900",
              color: "#111",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "18px",
            }}
          >
            슬램의 서비스
          </h2>
          <p style={{ fontSize: "15px", color: "#777", maxWidth: "460px", margin: "0 auto", lineHeight: 1.8 }}>
            브랜드 성장 목표에 맞는<br />최적의 인플루언서 마케팅 솔루션을 제공합니다.
          </p>
        </div>

        {/* Expanding panels */}
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Panel row */}
          <div style={{ display: "flex", gap: "10px" }}>
            {SERVICES.map((service) => {
              const isActive = activeId === service.id;
              const hasActive = activeId !== null;
              return (
                <div
                  key={service.id}
                  onClick={() => setActiveId(isActive ? null : service.id)}
                  style={{
                    flex: isActive && hasActive ? 2.2 : 1,
                    height: hasActive ? "88px" : "500px",
                    backgroundColor: "#111",
                    borderRadius: hasActive && isActive ? "18px 18px 0 0" : "18px",
                    cursor: "pointer",
                    transition: "flex 0.48s cubic-bezier(0.4, 0, 0.2, 1), height 0.48s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.35s ease, background-color 0.2s",
                    padding: hasActive ? "0 24px" : "44px 32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: hasActive ? "center" : "flex-end",
                    overflow: "hidden",
                    position: "relative",
                    outline: isActive ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                    outlineOffset: "-1px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = "#1a1a1a";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = "#111";
                  }}
                >
                  <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "200px", background: "radial-gradient(circle at top right, rgba(255,255,255,0.04) 0%, transparent 65%)", pointerEvents: "none" }} />

                  <span style={{ fontSize: "10px", fontWeight: "700", color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", letterSpacing: "0.18em", marginBottom: hasActive ? "4px" : "18px", transition: "color 0.2s", flexShrink: 0 }}>
                    {service.tag}
                  </span>
                  <h3 style={{
                    fontSize: hasActive ? "15px" : "26px",
                    fontWeight: "800",
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.2,
                    transition: "font-size 0.3s ease",
                    whiteSpace: hasActive ? "nowrap" : "normal",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flexShrink: 0,
                  }}>
                    {service.title}
                  </h3>

                  {!hasActive && (
                    <>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {service.titleEn}
                      </p>
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.48)", lineHeight: 1.75, marginTop: "22px" }}>
                        {service.summary}
                      </p>
                      <div style={{ marginTop: "auto", paddingTop: "26px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em" }}>자세히 보기</span>
                        <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "16px" }}>→</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expanded detail — border-radius matches panel top (18px) */}
          {activeId && (() => {
            const svc = SERVICES.find(s => s.id === activeId)!;
            return (
              <div
                style={{
                  backgroundColor: "#0d0d0d",
                  borderRadius: "0 0 18px 18px",
                  padding: "64px 72px 72px",
                  animation: "expandDown 0.42s cubic-bezier(0.4, 0, 0.2, 1)",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Header */}
                <div style={{ marginBottom: "52px" }}>
                  <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.28)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "14px" }}>
                    {svc.tag} · {svc.titleEn}
                  </p>
                  <h2 style={{ fontSize: "clamp(36px, 4vw, 52px)", fontWeight: "900", color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {svc.title}
                  </h2>
                </div>

                {/* Description */}
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.68)", lineHeight: 1.9, maxWidth: "800px", marginBottom: "56px" }}>
                  {svc.detail.description}
                </p>

                {/* Key points */}
                {svc.detail.points.length > 0 && (
                  <div style={{ marginBottom: "56px" }}>
                    <SectionLabel dark>주요 특징</SectionLabel>
                    <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
                      {svc.detail.points.map((pt, i) => (
                        <div key={i} style={{ flex: "1 1 160px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "22px 24px", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.32)", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "9px" }}>{pt.label}</p>
                          <p style={{ fontSize: "15px", color: "#fff", fontWeight: "700" }}>{pt.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tiers */}
                {svc.detail.tiers && svc.detail.tiers.length > 0 && (
                  <div style={{ marginBottom: "56px" }}>
                    <SectionLabel dark>규모별 운영 전략</SectionLabel>
                    <div style={{ display: "flex", gap: "14px", marginTop: "20px" }}>
                      {svc.detail.tiers.map((tier, i) => (
                        <div key={i} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <div style={{ padding: "18px 22px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "10px", fontWeight: "800", backgroundColor: "rgba(255,255,255,0.13)", color: "#fff", padding: "3px 12px", borderRadius: "20px", letterSpacing: "0.1em", flexShrink: 0 }}>
                              {tier.badge}
                            </span>
                            <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff" }}>{tier.level}</span>
                          </div>
                          <div style={{ padding: "20px 22px" }}>
                            <ul style={{ margin: "0 0 16px", paddingLeft: "18px" }}>
                              {tier.features.map((f, j) => (
                                <li key={j} style={{ fontSize: "13px", color: "rgba(255,255,255,0.58)", lineHeight: 1.8 }}>{f}</li>
                              ))}
                            </ul>
                            <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "12px 16px", borderLeft: "3px solid rgba(255,255,255,0.25)" }}>
                              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.48)", lineHeight: 1.7 }}>
                                <strong style={{ color: "rgba(255,255,255,0.72)" }}>기대 효과 — </strong>{tier.effect}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                <div style={{ marginBottom: "56px" }}>
                  <SectionLabel dark>레퍼런스 영상</SectionLabel>
                  <div style={{ marginTop: "20px" }}>
                    {svc.detail.videoUrl ? (
                      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: "16px", overflow: "hidden", backgroundColor: "#000" }}>
                        <iframe
                          src={svc.detail.videoUrl}
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div style={{ height: "260px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                        <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "20px", marginLeft: "3px" }}>▶</span>
                        </div>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.28)", fontWeight: "500" }}>레퍼런스 영상이 곧 추가됩니다</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expected outcome */}
                <div style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "20px", padding: "32px 36px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)", fontWeight: "700", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "14px" }}>
                    Expected Outcome
                  </p>
                  <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.82)", lineHeight: 1.88, fontWeight: "500" }}>
                    {svc.detail.effect}
                  </p>
                </div>
              </div>
            );
          })()}
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
