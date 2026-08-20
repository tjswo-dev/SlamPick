"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import ContentGuideCta from "@/components/ContentGuideCta";
import { CONTENT_GUIDES } from "@/lib/content-guides";

interface TierVideo {
  url: string;
  challenge: string;
  outcome: string;
  metrics: { label: string; value: string }[];
}

interface ServiceTier {
  level: string;
  badge: string;
  price?: string;
  features: string[];
  effect: string;
  videos?: TierVideo[];
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
    videoUrls?: string[];
    partners?: { name: string; store: string; handle: string; url: string; avatar?: string }[];
    subCategories?: {
      title: string;
      description: string;
      videoUrls?: string[];
    }[];
  };
}

const SERVICES: ServiceData[] = [
  {
    id: "visit",
    tag: "01",
    title: "OWM 방문 콘텐츠",
    titleEn: "Location-Based Content",
    summary: "크리에이터가 OWM 약국에 방문해 매대에 진열된 브랜드 제품을 직접 집어 들고 소개합니다. 촬영 장소가 곧 판매처이기 때문에, 제품 인지부터 구매처 안내까지 한 콘텐츠로 해결됩니다.",
    detail: {
      description:
        "크리에이터가 OWM 약국에 방문해 매대에 진열된 브랜드 제품을 직접 집어 들고 소개합니다. 실제 판매 현장에서 촬영되기 때문에, 제품 인지부터 구매처 안내까지 한 콘텐츠로 해결됩니다.\n\n크리에이터가 OWM 약국을 방문해 매대에 진열된 브랜드 제품을 직접 고르고, 성분·사용법·추천 이유를 자기 언어로 소개합니다. 스튜디오에서 만든 광고가 아니라 실제 유통 현장에서 촬영되기 때문에, 소비자에게는 '검증을 통과해 매대에 올라온 제품'으로 읽힙니다.",
      points: [],
      effect:
        "대부분의 광고는 '갖고 싶다'까지 데려가고 멈춥니다. OWM 방문 콘텐츠는 그다음 한 걸음, '사러 가야겠다'까지를 설계합니다. 약국이라는 공간의 전문성이 제품에 신뢰를 더하고, 촬영된 장소가 곧 판매처이기 때문에 소비자는 제품을 기억하는 순간 살 곳까지 함께 기억합니다.\n\n제품 인지 · 구매처 각인 · 오프라인 전환을 한 번의 제작으로 확보할 수 있습니다.",
      videoUrls: [
        "https://www.xiaohongshu.com/explore/6a70237f000000002500e201?xsec_token=CBrhFqPrtpQAsRF5jPRshf4_IE9zC8BeoSRNzbP8Zu-3M=&xsec_source=pc_share&source=webshare",
        "https://www.xiaohongshu.com/explore/6a7012000000000022017709?xsec_token=CBrhFqPrtpQAsRF5jPRshf456hsvFAw_OzGlekvuWMsyY=&xsec_source=pc_share&source=webshare",
        "https://www.instagram.com/reel/DanWmjJz66J/embed/",
      ],
      tiers: [
        {
          level: "왕홍 · 메가",
          badge: "MEGA",
          price: "200~300만원",
          features: [
            "팔로워 100만+ 이상의 메가 크리에이터",
            "단기간 폭발적 브랜드 인지도 확산",
            "OWM 매장 방문 콘텐츠로 구매 목적지까지 각인",
          ],
          effect: "압도적인 도달률로 브랜드를 빠르게 각인시키고, OWM을 방문해야 할 이유를 대중에게 동시에 전달합니다.",
        },
        {
          level: "미들",
          badge: "MIDDLE",
          price: "50~100만원",
          features: [
            "팔로워 10만~100만의 중견 크리에이터",
            "탄탄한 팬층과 높은 신뢰도 기반 추천",
            "메가급 대비 높은 참여율과 구매 전환율",
          ],
          effect: "신뢰도 높은 팔로워십을 바탕으로 '약국에서 직접 사야 한다'는 구매 행동으로 자연스럽게 연결합니다.",
        },
        {
          level: "마이크로",
          badge: "MICRO",
          price: "20~30만원",
          features: [
            "팔로워 1만~10만의 일상 밀착형 크리에이터",
            "광고보다 친구 추천에 가까운 높은 공감도",
            "다수 운영 시 누적 도달과 콘텐츠 자산 동시 확보",
          ],
          effect: "소규모지만 밀도 높은 팬과의 소통으로 실구매 전환율이 높고, 여러 명 동시 운영 시 비용 대비 최고 효율을 냅니다.",
        },
      ],
    },
  },
  {
    id: "pharmacist",
    tag: "02",
    title: "약사 신뢰형 콘텐츠",
    titleEn: "Pharmacist Trust Content",
    summary: "현직 약사 크리에이터가 브랜드 제품의 성분과 효능을 직접 설명하고 추천합니다. 메시지가 아니라 화자를 바꿈으로써, 광고로 걸러지던 내용이 신뢰할 수 있는 정보가 됩니다.",
    detail: {
      description:
        "현직 약사 크리에이터가 브랜드 제품의 성분과 효능을 직접 설명하고 추천하는 콘텐츠입니다.\n소비자는 브랜드가 스스로 좋다고 말하는 순간, 그것을 광고로 걸러 듣습니다. 약사 신뢰형 콘텐츠는 메시지가 아니라 화자를 바꿉니다.\n\n성분이 곧 구매 이유가 되는 건강기능식품·더마 코스메틱 같은 분야에서 소비자가 가장 신뢰하는 화자는 약사입니다. 약사가 설명하는 순간 제품의 설득 구조가 바뀝니다. '좋다더라'가 아니라 '왜 좋은지'가 근거와 함께 전달되기 때문에 구매 전환의 질이 달라집니다.",
      points: [],
      effect:
        "약사가 직접 설명한 콘텐츠는 제품에 전문가 신뢰를 부여하고, 그 신뢰는 소비자의 구매까지 이어집니다. 그리고 그 영상은 캠페인이 끝난 뒤에도 브랜드의 광고 소재로 남습니다.\n\n제품 신뢰도 · 구매 전환 · 광고 소재를 한 번의 제작으로 확보할 수 있습니다.",
      videoUrls: [
        "https://www.instagram.com/reel/DYq3zKax3Z7/embed/",
        "https://www.instagram.com/reel/DUaXZRVE53V/embed/",
      ],
      partners: [
        { name: "Jun", store: "이태원점", handle: "@kpharmacist_jun", url: "https://www.tiktok.com/@kpharmacist_jun", avatar: "/avatar-jun.png" },
        { name: "David", store: "성수점", handle: "@kpharmacist_david", url: "https://www.tiktok.com/@kpharmacist_david", avatar: "/avatar-david.png" },
        { name: "kpharmacistcouple", store: "신사점", handle: "@kpharmacistcouple", url: "https://www.tiktok.com/@kpharmacistcouple", avatar: "/avatar-kpharmacistcouple.png" },
        { name: "Knock", store: "북촌점", handle: "@knock.kpharmacist", url: "https://www.tiktok.com/@knock.kpharmacist", avatar: "/avatar-knock.png" },
      ],
    },
  },
  {
    id: "derma",
    tag: "03",
    title: "피부과 연계 콘텐츠",
    titleEn: "Dermatology Partnership Content",
    summary: "인플루언서가 피부과에서 시술받는 장면부터 약국에서 브랜드 제품을 구매하는 순간까지 담습니다. 스킨케어 관심이 가장 높아지는 시점에 브랜드 제품을 정확히 도착시킵니다.",
    detail: {
      description:
        "인플루언서가 피부과에서 시술받는 장면부터 OWM 약국에서 브랜드 제품을 구매하는 순간까지를 담습니다. 이 콘텐츠는 관심이 가장 높은 순간에만 도착합니다.\n\n시술 직후는 소비자가 스스로 제품을 찾아 나서는 구간입니다. 그 타이밍에 브랜드 제품이 등장함으로써, 제품은 광고가 아니라 '시술 후 반드시 거쳐야 할 다음 단계'로 인식됩니다.",
      points: [
        { label: "시술 키워드", value: "시술 후 저자극 · 시술 후 케어 · 시술 후 유지" },
        { label: "연계 시술", value: "리쥬란 · 울쎄라 · 보톡스 · 레이저 등" },
        { label: "적합 카테고리", value: "스킨케어 · 더마 코스메틱 · 선케어" },
      ],
      effect:
        "시술과 제품이 하나의 흐름 안에 놓이면 '시술을 받았다면 이 제품이 필요하다'는 구매 당위성이 생깁니다. 그리고 한국 피부과·한국 시술을 검색하는 사람이 있는 한, 이 콘텐츠는 계속 재생되며 브랜드 제품을 노출시킵니다.\n\n시술 후 수요 선점 · 검색 유입 · 구매 전환을 한 번의 제작으로 확보할 수 있습니다.",
      videoUrls: [
        "https://www.tiktok.com/embed/v2/7444000169235926303",
        "https://www.tiktok.com/embed/v2/7660796892451769630",
      ],
    },
  },
  {
    id: "seeding",
    tag: "04",
    title: "시딩 콘텐츠",
    titleEn: "Tiered Influencer Seeding",
    summary: "OWM 매대 진열 사진·영상을 시딩 콘텐츠에 포함시켜 현지 크리에이터의 CTA를 OWM 구매로 연결합니다. 바이럴 도달과 오프라인 전환을 하나의 콘텐츠로 달성합니다.",
    detail: {
      description:
        "브랜드 시딩을 진행할 때 제품과 함께 OWM 매대 진열 사진과 매장 영상을 현지 크리에이터에게 제공합니다.\n크리에이터는 이를 콘텐츠에 자연스럽게 녹여내고, 마지막 CTA를 'OWM에서 구매하기'로 연결합니다.\n현지 시딩의 바이럴 도달 효과에 OWM이라는 명확한 구매 목적지를 결합해, '보고 끝'이 아니라 '보고 사러 간다'는 소비 행동 전환을 만들어내는 전략입니다.",
      points: [],
      effect:
        "현지 크리에이터의 콘텐츠가 단순 인지도 확산에 그치지 않고 OWM 오프라인 방문과 구매까지 연결됩니다. 특히 해외 시장에서 K-뷰티 프리미엄 채널로서 OWM을 각인시키는 데 효과적이며, 시딩 규모가 쌓일수록 OWM의 현지 브랜드 신뢰도도 함께 성장합니다.",
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
          videos: [
            {
              url: "https://www.tiktok.com/embed/v2/7530013023667309879",
              challenge: "신규 브랜드 및 해외 론칭 브랜드의 후킹 디렉션을 통한 히어로 콘텐츠 생산 및 콘텐츠 자산 축적",
              outcome: "수개월간 꾸준히 진행 시, 퀄리티 높고 신박한 바이럴 콘텐츠가 터지며 브랜드 효자 제품으로 견인",
              metrics: [
                { label: "누적 조회수", value: "2M+" },
                { label: "채널 확장", value: "Amazon 매출 2,000%↑" },
              ],
            },
            {
              url: "https://www.instagram.com/reel/DZsStHcB-dj/embed/",
              challenge: "",
              outcome: "",
              metrics: [],
            },
          ],
        },
        {
          level: "미들급",
          badge: "MIDDLE",
          features: [
            "메가급보다 더 탄탄하고 밀도 높은 팬층 보유",
            "강한 팔로워십과 활발한 소통으로 높은 신뢰도 형성",
          ],
          effect:
            "브랜드의 2차 마케팅 활용 소재로 사용하기에 가장 적합한 고효율 그룹",
          videos: [
            {
              url: "https://www.tiktok.com/embed/v2/7645253106598546708",
              challenge: "현지 특성을 분석한 인플루언서 매칭 및 제품 소구점을 제대로 살리는 콘텐츠 제작",
              outcome: "큐텐 카테고리 1위 달성 및 오프라인 매출 증대",
              metrics: [
                { label: "큐텐 카테고리", value: "1위" },
                { label: "오프라인 매출", value: "500%↑" },
              ],
            },
            {
              url: "https://www.instagram.com/reel/DaXZG26NHSh/embed/",
              challenge: "",
              outcome: "",
              metrics: [],
            },
          ],
        },
        {
          level: "메가급",
          badge: "MEGA",
          features: [
            "압도적인 대중적 인지도와 강한 팔로워십 보유",
            "엄청난 도달률과 노출량으로 단기간 브랜드 각인 효과",
          ],
          effect:
            "메가 크리에이터가 가진 강력한 이미지를 브랜드 이미지로 융합시켜 가치 격상",
          videos: [
            {
              url: "https://www.tiktok.com/embed/v2/7471724419216346398",
              challenge: "브랜드 소구점과 중동 국가 타겟한 하이소사이어티·웰니스 인플루언서 매칭",
              outcome: "초도 물량 완판 및 중동 진출 성공, 공동 런칭 후 매출 0에서 월매출 20억 이상의 히트상품으로 성장",
              metrics: [
                { label: "중동 시장 진출", value: "성공" },
                { label: "초도 물량", value: "완판" },
                { label: "월매출", value: "0 → 20억" },
              ],
            },
            {
              url: "https://www.instagram.com/p/DZ99OkNqyi_/embed/",
              challenge: "",
              outcome: "",
              metrics: [],
            },
          ],
        },
      ],
    },
  },
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const servicesRef = useRef<HTMLDivElement>(null);
  const slamPickHeadingRef = useRef<HTMLDivElement>(null);

  const [heroAnimated, setHeroAnimated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ email: string } | null>(null);
  const [showCTA, setShowCTA] = useState(false);
  const [logoExpanded, setLogoExpanded] = useState(false);

  const [applyBrand, setApplyBrand] = useState("");
  const [applyManager, setApplyManager] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyOwmBudget, setApplyOwmBudget] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applyDone, setApplyDone] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

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

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError("");
    setApplyLoading(true);
    const res = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand: applyBrand, manager: applyManager, email: applyEmail, phone: applyPhone, owmBudget: applyOwmBudget }),
    });
    const data = await res.json();
    if (!res.ok) {
      setApplyError(data.error ?? "오류가 발생했습니다. 다시 시도해주세요.");
      setApplyLoading(false);
      return;
    }
    setApplyDone(true);
    setApplyLoading(false);
  };

  const scrollToServices = () => {
    setHeroAnimated(true);
    setServicesExpanded(true);
    // expand 레이아웃이 잡힌 뒤, 서비스 섹션 SLAM PICK이 화면 최상단에 오도록 스크롤
    const scrollHeadingToTop = () => {
      const el = slamPickHeadingRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - 16), behavior: "smooth" });
    };
    requestAnimationFrame(() => {
      setTimeout(scrollHeadingToTop, 80);
      setTimeout(scrollHeadingToTop, 420);
    });
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setLoggedInUser({ email: data.user.email ?? "" });
    });
  }, []);

  useEffect(() => {
    const el = slamPickHeadingRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setServicesExpanded(true); },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        :root { --ease-out: cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); filter: blur(2px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.985); filter: blur(2px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
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
          from { opacity: 0; transform: translateY(18px); filter: blur(2px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes heroRise {
          from { opacity: 0; transform: translateY(22px); filter: blur(3px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes logoReveal {
          0% {
            opacity: 0;
            letter-spacing: 0.42em;
            transform: translateY(28px) scale(0.94);
            filter: blur(10px);
          }
          55% {
            opacity: 1;
            filter: blur(0);
          }
          100% {
            opacity: 1;
            letter-spacing: -0.04em;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes logoCharIn {
          from {
            opacity: 0;
            transform: translateY(0.55em);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        @keyframes detailReveal {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .home-hero-logo {
          animation: logoReveal 1.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .home-hero-logo-title {
          position: relative;
          display: inline-flex;
          gap: 0.02em;
        }
        .home-hero-logo-char {
          display: inline-block;
          opacity: 0;
          animation: logoCharIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .home-hero-bar {
          animation: heroRise 1.15s var(--ease-out) 0.55s both;
        }
        .home-hero-cta {
          animation: heroRise 1.15s var(--ease-out) 0.78s both;
        }
        .home-btn {
          transition: background-color 0.4s var(--ease-out), color 0.4s var(--ease-out), border-color 0.4s var(--ease-out), opacity 0.35s var(--ease-out), transform 0.35s var(--ease-out) !important;
        }
        .home-btn:hover {
          transform: translateY(-1px);
        }
        .home-service-panel {
          transition: flex 0.7s var(--ease-out), height 0.7s var(--ease-out), border-radius 0.5s var(--ease-out), background-color 0.4s var(--ease-out), outline-color 0.4s var(--ease-out), padding 0.5s var(--ease-out) !important;
        }
        .home-service-panel span,
        .home-service-panel h3,
        .home-service-panel p {
          transition: color 0.45s var(--ease-out), font-size 0.5s var(--ease-out), margin 0.5s var(--ease-out), opacity 0.45s var(--ease-out) !important;
        }
        ::placeholder { color: rgba(255,255,255,0.25); }
        * { box-sizing: border-box; }
        @media (prefers-reduced-motion: reduce) {
          .home-hero-logo, .home-hero-bar, .home-hero-cta,
          .home-hero-logo-char,
          [style*="animation"] {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            letter-spacing: -0.04em !important;
          }
          .home-btn, .home-service-panel {
            transition: none !important;
          }
        }
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
        <div
          className={heroReady ? "home-hero-logo" : undefined}
          style={{ textAlign: "center", opacity: heroReady ? undefined : 0 }}
        >
          <h1
            onClick={() => setLogoExpanded((v) => !v)}
            className="home-hero-logo-title"
            style={{
              fontSize: "clamp(48px, 10vw, 96px)",
              fontWeight: "900",
              color: "#fff",
              letterSpacing: "-0.04em",
              lineHeight: "1",
              fontFamily: "system-ui, -apple-system, sans-serif",
              cursor: "pointer",
              transition: "opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              userSelect: "none",
              position: "relative",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.82"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {"SLAM PICK".split("").map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                className={heroReady ? "home-hero-logo-char" : undefined}
                style={{
                  animationDelay: heroReady ? `${0.18 + i * 0.045}s` : undefined,
                  width: ch === " " ? "0.28em" : undefined,
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </h1>
        </div>

        {/* Bar + glow */}
        <div
          className={heroReady ? "home-hero-bar" : undefined}
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            opacity: heroReady ? undefined : 0,
          }}
        >
          <div
            style={{
              marginTop: "16px",
              width: (heroAnimated || logoExpanded) ? "100vw" : "clamp(280px, 45vw, 460px)",
              height: "2px",
              background: "linear-gradient(90deg, transparent, #fff, transparent)",
              transition: "width 1.15s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 1.15s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: (heroAnimated || logoExpanded)
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
              height: (heroAnimated || logoExpanded) ? "55vh" : "0",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 40%, transparent 100%)",
              transition: "height 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.08s",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* 히어로 중앙 영역 */}
        <div
          className={heroReady ? "home-hero-cta" : undefined}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "360px",
            padding: "0 24px",
            marginTop: "48px",
            opacity: heroReady ? undefined : 0,
          }}
        >
          {logoExpanded ? (
            /* ── 로그인 / 대시보드 ── */
            loggedInUser ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fadeSlideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both" }}>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", textAlign: "center", letterSpacing: "0.04em" }}>
                  {loggedInUser.email}
                </p>
                <button
                  className="home-btn"
                  onClick={() => router.push(loggedInUser.email === "admin@slam-global.com" ? "/admin" : "/dashboard")}
                  style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "14px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.15em", cursor: "pointer", textTransform: "uppercase" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
                >
                  대시보드로 이동 →
                </button>
                <button
                  className="home-btn"
                  onClick={async () => { await supabase.auth.signOut(); setLoggedInUser(null); setLogoExpanded(false); }}
                  style={{ width: "100%", background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", padding: "8px", fontSize: "12px", cursor: "pointer", letterSpacing: "0.08em" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleLogin}
                style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "fadeSlideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both" }}
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
                  className="home-btn"
                  style={{ marginTop: "4px", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "14px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.15em", cursor: loading ? "default" : "pointer", textTransform: "uppercase", opacity: loading ? 0.5 : 1 }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
                >
                  {loading ? "로그인 중..." : "Log In"}
                </button>
                <button
                  type="button"
                  className="home-btn"
                  onClick={() => router.push("/signup")}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: "13px", cursor: "pointer", padding: "8px" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                >
                  계정이 없으신가요? 회원가입
                </button>
              </form>
            )
          ) : (
            /* ── 서비스 소개 버튼 ── */
            <button
              className="home-btn"
              onClick={scrollToServices}
              style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "14px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.15em", cursor: "pointer", textTransform: "uppercase" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
            >
              서비스 소개 ↓
            </button>
          )}
        </div>


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
      <section style={{ backgroundColor: "#f2f2f2", padding: "28px 40px 120px" }}>
        {/* Heading */}
        <div
          ref={slamPickHeadingRef}
          style={{
            textAlign: "center",
            marginBottom: servicesExpanded ? "72px" : "0",
            transition: "margin-bottom 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
            scrollMarginTop: "16px",
          }}
        >
          <h2
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              fontSize: "clamp(48px, 10vw, 96px)",
              fontWeight: "900",
              color: "#000",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              fontFamily: "system-ui, -apple-system, sans-serif",
              cursor: "pointer",
              transition: "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            SLAM PICK
          </h2>

          {/* Bar + glow — 히어로와 동일 구조 */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <div
              style={{
                width: servicesExpanded ? "100vw" : "clamp(280px, 45vw, 460px)",
                height: "2px",
                background: "linear-gradient(90deg, transparent, #000, transparent)",
                transition: "width 1.15s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 1.15s cubic-bezier(0.22, 1, 0.36, 1)",
                boxShadow: servicesExpanded
                  ? "0 0 12px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.25), 0 0 100px rgba(0,0,0,0.08)"
                  : "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "100vw",
                height: servicesExpanded ? "45vh" : "0",
                background: "linear-gradient(to bottom, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.03) 40%, transparent 100%)",
                transition: "height 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.08s",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Subtitle */}
          <p
            style={{
              marginTop: "28px",
              fontSize: "clamp(14px, 1.6vw, 17px)",
              color: "#6b7280",
              fontWeight: "400",
              letterSpacing: "-0.01em",
              lineHeight: 1.7,
              textAlign: "center",
              opacity: servicesExpanded ? 1 : 0,
              transform: servicesExpanded ? "translateY(0)" : "translateY(12px)",
              filter: servicesExpanded ? "blur(0)" : "blur(2px)",
              transition: "opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.35s, transform 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.35s, filter 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.35s",
              pointerEvents: "none",
            }}
          >
            OWM 매대 매출 성장부터 글로벌 인지도 확산, 전문가 신뢰 구축까지 — 브랜드의 목표에 맞는 최적의 인플루언서 마케팅 솔루션을 제공합니다.
          </p>

        </div>

        {/* Expanding panels — 확장 시 페이드인 */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", animation: servicesExpanded ? "expandDown 1s cubic-bezier(0.22, 1, 0.36, 1) 0.55s both" : "none", display: servicesExpanded ? "block" : "none" }}>
          {/* Panel row */}
          <div style={{ display: "flex", gap: "10px" }}>
            {SERVICES.map((service, serviceIndex) => {
              const isActive = activeId === service.id;
              const hasActive = activeId !== null;
              return (
                <div
                  key={service.id}
                  className="home-service-panel"
                  onClick={() => setActiveId(isActive ? null : service.id)}
                  style={{
                    flex: isActive && hasActive ? 2.2 : 1,
                    height: hasActive ? "88px" : "500px",
                    backgroundColor: "#111",
                    borderRadius: hasActive && isActive ? "18px 18px 0 0" : "18px",
                    cursor: "pointer",
                    padding: hasActive ? "0 24px" : "44px 32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: hasActive ? "center" : "flex-end",
                    overflow: "hidden",
                    position: "relative",
                    outline: isActive ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                    outlineOffset: "-1px",
                    animation: servicesExpanded ? `expandDown 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${0.65 + serviceIndex * 0.08}s both` : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = "#1a1a1a";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = "#111";
                  }}
                >
                  <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "200px", background: "radial-gradient(circle at top right, rgba(255,255,255,0.04) 0%, transparent 65%)", pointerEvents: "none" }} />

                  <span style={{ fontSize: "11px", fontWeight: "700", color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)", letterSpacing: "0.18em", marginBottom: hasActive ? "4px" : "18px", flexShrink: 0 }}>
                    {service.tag}
                  </span>
                  <h3 style={{
                    fontSize: hasActive ? "15px" : "clamp(18px, 1.8vw, 28px)",
                    fontWeight: "800",
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flexShrink: 0,
                  }}>
                    {service.title}
                  </h3>

                  {!hasActive && (
                    <>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {service.titleEn}
                      </p>
                      <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.62)", lineHeight: 1.75, marginTop: "22px", wordBreak: "keep-all" }}>
                        {service.summary}
                      </p>
                      <div style={{ marginTop: "auto", paddingTop: "26px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>자세히 보기</span>
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px" }}>→</span>
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
            const activeIndex = SERVICES.findIndex(s => s.id === activeId);
            const isFirst = activeIndex === 0;
            const isLast = activeIndex === SERVICES.length - 1;
            const detailRadius = `${isFirst ? "0" : "18px"} ${isLast ? "0" : "18px"} 18px 18px`;
            return (
              <div
                style={{
                  backgroundColor: "#0d0d0d",
                  borderRadius: detailRadius,
                  padding: "64px 72px 72px",
                  animation: "detailReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Header */}
                <>
                  <div style={{ marginBottom: "52px" }}>
                    <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.28)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "14px" }}>
                      {svc.tag} · {svc.titleEn}
                    </p>
                    <h2 style={{ fontSize: "clamp(36px, 4vw, 52px)", fontWeight: "900", color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>
                      {svc.title}
                    </h2>
                  </div>
                  <div style={{ marginBottom: "56px" }}>
                    {svc.detail.description.split("\n\n").map((para, i) => (
                      <p key={i} style={{ fontSize: "16px", color: "rgba(255,255,255,0.68)", lineHeight: 1.9, wordBreak: "keep-all", whiteSpace: "pre-line", marginBottom: i < svc.detail.description.split("\n\n").length - 1 ? "20px" : 0 }}>
                        {para}
                      </p>
                    ))}
                  </div>
                </>

                {/* Key points */}
                {svc.detail.points.length > 0 && (
                  <div style={{ marginBottom: "56px" }}>
                    <SectionLabel dark>주요 특징</SectionLabel>
                    <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
                      {svc.detail.points.map((pt, i) => (
                        <div key={i} style={{ flex: "1 1 160px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "22px 24px", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.32)", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "9px" }}>{pt.label}</p>
                          <p style={{ fontSize: "15px", color: "#fff", fontWeight: "700", wordBreak: "keep-all" }}>{pt.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tiers */}
                {svc.detail.tiers && svc.detail.tiers.length > 0 && (
                  <div style={{ marginBottom: "56px" }}>
                    {svc.id === "seeding" ? (
                      /* ── 시딩: 나노/미들/메가 영상+효과 레이아웃 ── */
                      <div>
                        {svc.detail.tiers.map((tier, i) => (
                          <div key={i} style={{ marginBottom: i < svc.detail.tiers!.length - 1 ? "64px" : 0 }}>
                            {/* Tier header */}
                            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
                              <span style={{ fontSize: "10px", fontWeight: "800", backgroundColor: "#fff", color: "#000", padding: "4px 14px", borderRadius: "20px", letterSpacing: "0.1em" }}>
                                {tier.badge}
                              </span>
                              <span style={{ fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-0.03em" }}>{tier.level}</span>
                            </div>
                            {/* Features */}
                            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: "28px", wordBreak: "keep-all" }}>
                              {tier.features.join("  ·  ")}
                            </p>
                            {/* Video cards — [영상] [영상] [설명 1개] */}
                            <div style={{ display: "flex", gap: "32px", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "20px", padding: "28px 32px", border: "1px solid rgba(255,255,255,0.07)" }}>
                              {/* 두 폰 목업 나란히 */}
                              <div style={{ display: "flex", gap: "14px", flexShrink: 0 }}>
                                {(tier.videos ?? []).map((video, j) => (
                                  <div key={j} style={{ width: "280px", height: "560px", borderRadius: "22px", border: "4px solid rgba(255,255,255,0.1)", overflow: "hidden", backgroundColor: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {video.url ? (
                                      <iframe
                                        src={video.url}
                                        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        scrolling={video.url.includes("tiktok.com") ? "no" : undefined}
                                        allowFullScreen
                                      />
                                    ) : (
                                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                          <span style={{ fontSize: "14px", marginLeft: "2px", color: "rgba(255,255,255,0.3)" }}>▶</span>
                                        </div>
                                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", fontWeight: "500" }}>영상 준비중</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* 오른쪽 설명 — 첫 번째 영상 기준 1개만 */}
                              {(tier.videos ?? []).slice(0, 1).map((video, j) => (
                                <div key={j} style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ marginBottom: "72px" }}>
                                    <p style={{ fontSize: "12px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "8px" }}>Challenge</p>
                                    <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.82)", lineHeight: 1.75, wordBreak: "keep-all" }}>{video.challenge}</p>
                                  </div>
                                  <div style={{ marginBottom: "48px" }}>
                                    <p style={{ fontSize: "12px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "8px" }}>Outcome</p>
                                    <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.82)", lineHeight: 1.75, wordBreak: "keep-all" }}>{video.outcome}</p>
                                  </div>
                                  <div style={{ marginBottom: "48px" }}>
                                    <p style={{ fontSize: "12px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "8px" }}>기대 효과</p>
                                    <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.82)", lineHeight: 1.75, wordBreak: "keep-all" }}>{tier.effect}</p>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "center" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                                      {video.metrics.map((m, k) => (
                                        <div key={k} style={{ backgroundColor: "rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px 28px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                                          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "600", letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase" }}>{m.label}</p>
                                          <p style={{ fontSize: "28px", fontWeight: "900", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>{m.value}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Tier divider */}
                            {i < svc.detail.tiers!.length - 1 && (
                              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.07)", marginTop: "64px" }} />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* ── 일반 티어 카드 레이아웃 ── */
                      <>
                        <SectionLabel dark>규모별 운영 전략</SectionLabel>
                        <div style={{ display: "flex", gap: "14px", marginTop: "20px" }}>
                          {svc.detail.tiers.map((tier, i) => (
                            <div key={i} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                              <div style={{ padding: "18px 22px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: tier.price ? "10px" : "0" }}>
                                  <span style={{ fontSize: "10px", fontWeight: "800", backgroundColor: "rgba(255,255,255,0.13)", color: "#fff", padding: "3px 12px", borderRadius: "20px", letterSpacing: "0.1em", flexShrink: 0 }}>
                                    {tier.badge}
                                  </span>
                                  <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff" }}>{tier.level}</span>
                                </div>
                                {tier.price && (
                                  <p style={{ fontSize: "20px", fontWeight: "900", color: "#fff", letterSpacing: "-0.03em", margin: 0 }}>
                                    {tier.price}
                                    <span style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.4)", marginLeft: "4px" }}>/ 건</span>
                                  </p>
                                )}
                              </div>
                              <div style={{ padding: "20px 22px" }}>
                                <ul style={{ margin: "0 0 16px", paddingLeft: "18px" }}>
                                  {tier.features.map((f, j) => (
                                    <li key={j} style={{ fontSize: "13px", color: "rgba(255,255,255,0.58)", lineHeight: 1.8, wordBreak: "keep-all" }}>{f}</li>
                                  ))}
                                </ul>
                                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "12px 16px", borderLeft: "3px solid rgba(255,255,255,0.25)" }}>
                                  <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                                    <strong style={{ color: "#fff" }}>기대 효과 — </strong>{tier.effect}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Sub-categories (e.g. 신뢰형 콘텐츠 내 약사추천 / 피부과 연계) */}
                {svc.detail.subCategories && svc.detail.subCategories.length > 0 && (
                  <div style={{ marginBottom: "56px" }}>
                    {svc.detail.subCategories.map((sub, si) => (
                      <div key={si} style={{ marginBottom: si < svc.detail.subCategories!.length - 1 ? "56px" : 0 }}>
                        {/* 중제목 */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "800", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", padding: "4px 14px", borderRadius: "20px", letterSpacing: "0.1em" }}>
                            0{si + 1}
                          </span>
                          <h4 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-0.03em", margin: 0 }}>
                            {sub.title}
                          </h4>
                        </div>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.65)", lineHeight: 1.85, marginBottom: "24px", wordBreak: "keep-all" }}>
                          {sub.description}
                        </p>
                        {/* 영상 */}
                        {sub.videoUrls && sub.videoUrls.length > 0 ? (
                          <div style={{ display: "flex", gap: "20px", flexWrap: "nowrap", justifyContent: "center" }}>
                            {sub.videoUrls.map((url, vi) => {
                              const vw = sub.videoUrls!.length >= 3 ? "330px" : "400px";
                              const vh = sub.videoUrls!.length >= 3 ? "640px" : "780px";
                              if (url.includes("xiaohongshu.com")) {
                                return (
                                  <a key={vi} href={url} target="_blank" rel="noopener noreferrer" style={{ width: vw, height: vh, flexShrink: 0, borderRadius: "16px", overflow: "hidden", backgroundColor: "#111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(255,36,66,0.25)", gap: "20px" }}>
                                    <div style={{ width: "72px", height: "72px", borderRadius: "18px", backgroundColor: "#FF2442", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <span style={{ fontSize: "13px", fontWeight: "900", color: "#fff", lineHeight: 1.2, textAlign: "center" }}>小红书</span>
                                    </div>
                                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>클릭하여 보기</span>
                                  </a>
                                );
                              }
                              return (
                                <div key={vi} style={{ width: vw, flexShrink: 0, borderRadius: "16px", overflow: "hidden", backgroundColor: "#000" }}>
                                  <iframe
                                    src={url}
                                    style={{ width: vw, height: vh, border: "none", display: "block" }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ height: "180px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                            <span style={{ fontSize: "20px", color: "rgba(255,255,255,0.15)" }}>▶</span>
                            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.28)", fontWeight: "500" }}>레퍼런스 영상이 곧 추가됩니다</p>
                          </div>
                        )}
                        {si < svc.detail.subCategories!.length - 1 && (
                          <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.07)", marginTop: "56px" }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Video */}
                {svc.id !== "seeding" && !svc.detail.subCategories && <div style={{ marginBottom: "56px" }}>
                  <SectionLabel dark>레퍼런스 영상</SectionLabel>
                  <div style={{ marginTop: "20px" }}>
                    {svc.detail.videoUrls && svc.detail.videoUrls.length > 0 ? (
                      <div style={{ display: "flex", gap: "20px", flexWrap: "nowrap", justifyContent: "center" }}>
                        {svc.detail.videoUrls.map((url, i) => {
                          const vw = svc.detail.videoUrls!.length >= 3 ? "330px" : "400px";
                          const vh = svc.detail.videoUrls!.length >= 3 ? "640px" : "780px";
                          if (url.includes("xiaohongshu.com")) {
                            return (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ width: vw, height: vh, flexShrink: 0, borderRadius: "16px", overflow: "hidden", backgroundColor: "#111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(255,36,66,0.25)", gap: "20px" }}>
                                <div style={{ width: "72px", height: "72px", borderRadius: "18px", backgroundColor: "#FF2442", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <span style={{ fontSize: "13px", fontWeight: "900", color: "#fff", lineHeight: 1.2, textAlign: "center" }}>小红书</span>
                                </div>
                                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>클릭하여 보기</span>
                              </a>
                            );
                          }
                          return (
                          <div key={i} style={{ width: vw, flexShrink: 0, borderRadius: "16px", overflow: "hidden", backgroundColor: "#000" }}>
                            <iframe
                              src={url}
                              style={{ width: vw, height: vh, border: "none", display: "block" }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              scrolling={url.includes("tiktok.com") ? "no" : undefined}
                              allowFullScreen
                            />
                          </div>
                          );
                        })}
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
                </div>}

                {/* Partners */}
                {svc.detail.partners && svc.detail.partners.length > 0 && (
                  <div style={{ marginBottom: "56px" }}>
                    <SectionLabel dark>함께하는 약사님들</SectionLabel>
                    <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                      {svc.detail.partners.map((p, pi) => (
                        <a key={pi} href={p.url} target="_blank" rel="noopener noreferrer"
                          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "14px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "18px 20px", border: "1px solid rgba(255,255,255,0.08)" }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)")}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                        >
                          <div style={{ width: "52px", height: "52px", borderRadius: "50%", flexShrink: 0, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.15)" }}>
                            {p.avatar
                              ? <img src={p.avatar} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <span style={{ fontSize: "18px", fontWeight: "700", color: "rgba(255,255,255,0.6)" }}>{p.name[0].toUpperCase()}</span>
                            }
                          </div>
                          <div>
                            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: "600", marginBottom: "3px" }}>{p.store}</p>
                            <p style={{ fontSize: "15px", color: "#fff", fontWeight: "700", marginBottom: "3px" }}>{p.name}</p>
                            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{p.handle}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expected outcome (subCategories가 있을 때도 표시) */}
                <div style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "20px", padding: "32px 36px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: "700", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "14px" }}>
                    Expected Outcome
                  </p>
                  <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.9)", lineHeight: 1.88, fontWeight: "500", wordBreak: "keep-all" }}>
                    {svc.detail.effect}
                  </p>
                </div>

                <ContentGuideCta
                  serviceId={svc.id}
                  subtitle={
                    CONTENT_GUIDES[svc.id]?.ctaSubtitle ??
                    "콘텐츠의 제작 방향을 확인해보세요."
                  }
                  guideCount={CONTENT_GUIDES[svc.id]?.guides.length ?? 0}
                />
              </div>
            );
          })()}
        </div>

        {/* ── 입점 문의 및 마케팅 신청하기 CTA ── */}
        <div style={{ maxWidth: "1280px", margin: "80px auto 0", animation: servicesExpanded ? "expandDown 1s cubic-bezier(0.22, 1, 0.36, 1) 1s both" : "none", display: servicesExpanded ? "block" : "none" }}>
          <div style={{ backgroundColor: "#111", borderRadius: "24px", padding: "72px 80px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.3)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "20px" }}>
              Ready to Start
            </p>
            <h3 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: "900", color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "16px" }}>
              입점 문의 및 마케팅 신청하기
            </h3>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "48px", wordBreak: "keep-all" }}>
              슬롯을 확인하고 브랜드에 맞는 인플루언서를 지금 바로 신청하세요.
            </p>

            {applyDone ? (
              <div style={{ animation: "fadeSlideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>✓</div>
                <p style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>신청이 완료되었습니다</p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>빠른 시일 내에 담당자가 연락드리겠습니다.</p>
              </div>
            ) : !showCTA ? (
              <button
                className="home-btn"
                onClick={() => setShowCTA(true)}
                style={{ background: "#fff", border: "none", color: "#000", padding: "16px 48px", fontSize: "14px", fontWeight: "700", letterSpacing: "0.15em", cursor: "pointer", textTransform: "uppercase", borderRadius: "2px" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.85)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
              >
                신청하기 →
              </button>
            ) : (
              <form
                onSubmit={handleApply}
                style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "400px", margin: "0 auto", animation: "fadeSlideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both" }}
              >
                <input
                  type="text"
                  placeholder="브랜드명"
                  value={applyBrand}
                  onChange={(e) => setApplyBrand(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
                />
                <input
                  type="text"
                  placeholder="담당자명"
                  value={applyManager}
                  onChange={(e) => setApplyManager(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
                />
                <input
                  type="email"
                  placeholder="이메일"
                  value={applyEmail}
                  onChange={(e) => setApplyEmail(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
                />
                <input
                  type="tel"
                  placeholder="전화번호"
                  value={applyPhone}
                  onChange={(e) => setApplyPhone(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
                />
                <input
                  type="text"
                  placeholder="OWM과 정해진 마케팅 예산"
                  value={applyOwmBudget}
                  onChange={(e) => setApplyOwmBudget(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
                />
                {applyError && <p style={{ fontSize: "13px", color: "#f87171", textAlign: "center" }}>{applyError}</p>}
                <button
                  type="submit"
                  disabled={applyLoading}
                  className="home-btn"
                  style={{ marginTop: "4px", background: "#fff", border: "none", color: "#000", padding: "15px", fontSize: "14px", fontWeight: "700", letterSpacing: "0.15em", cursor: applyLoading ? "default" : "pointer", textTransform: "uppercase", opacity: applyLoading ? 0.6 : 1, borderRadius: "2px" }}
                  onMouseEnter={(e) => { if (!applyLoading) e.currentTarget.style.background = "rgba(255,255,255,0.85)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                >
                  {applyLoading ? "전송 중..." : "신청서 보내기 →"}
                </button>
              </form>
            )}
          </div>
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
  transition: "border-color 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
  borderRadius: "2px",
};
