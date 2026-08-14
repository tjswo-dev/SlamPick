"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  ANALYZE_STEPS,
  CONTENT_GUIDES,
  type ContentGuideItem,
  type ContentGuideMeta,
} from "@/lib/content-guides";

const PAGE_SIZE = 4;
const STEP_MS = 1700;
const PHASE_OUT_MS = 520;
const LONG_TEXT_THRESHOLD = 160;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

interface ContentGuidePageClientProps {
  serviceId: string;
}

export default function ContentGuidePageClient({
  serviceId,
}: ContentGuidePageClientProps) {
  const router = useRouter();
  const meta = CONTENT_GUIDES[serviceId];
  const [phase, setPhase] = useState<"analyzing" | "leaving" | "list">(
    "analyzing"
  );
  const [step, setStep] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [prevVisibleCount, setPrevVisibleCount] = useState(0);

  useEffect(() => {
    setPhase("analyzing");
    setStep(0);
    setVisibleCount(PAGE_SIZE);
    setPrevVisibleCount(0);
    setExpandedId(null);

    const timers: ReturnType<typeof setTimeout>[] = [];
    ANALYZE_STEPS.forEach((_, i) => {
      if (i === 0) return;
      timers.push(setTimeout(() => setStep(i), STEP_MS * i));
    });
    timers.push(
      setTimeout(() => setPhase("leaving"), STEP_MS * ANALYZE_STEPS.length)
    );
    timers.push(
      setTimeout(
        () => {
          setPrevVisibleCount(0);
          setPhase("list");
        },
        STEP_MS * ANALYZE_STEPS.length + PHASE_OUT_MS
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [serviceId]);

  if (!meta) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "40px",
        }}
      >
        <p>해당 서비스 가이드를 찾을 수 없습니다.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          style={backBtnStyle}
        >
          ← 홈으로
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{MOTION_CSS}</style>

      <header
        className="cg-fade-in"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 28px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          animationDelay: "40ms",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          className="cg-link"
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.55)",
            fontSize: "13px",
            cursor: "pointer",
            padding: "6px 0",
          }}
        >
          ← SLAM PICK
        </button>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
          }}
        >
          {meta.shortLabel}
        </span>
      </header>

      {phase === "list" ? (
        <ListView
          meta={meta}
          visibleCount={visibleCount}
          prevVisibleCount={prevVisibleCount}
          expandedId={expandedId}
          onExpand={(id) => setExpandedId(id)}
          onCollapse={() => setExpandedId(null)}
          onLoadMore={() => {
            setPrevVisibleCount(visibleCount);
            setVisibleCount((n) => Math.min(n + PAGE_SIZE, meta.guides.length));
          }}
        />
      ) : (
        <AnalyzingView step={step} leaving={phase === "leaving"} />
      )}
    </main>
  );
}

function AnalyzingView({
  step,
  leaving,
}: {
  step: number;
  leaving: boolean;
}) {
  const progress = ((step + 1) / ANALYZE_STEPS.length) * 100;

  return (
    <div
      className={leaving ? "cg-phase-out" : "cg-phase-in"}
      style={{
        minHeight: "calc(100vh - 65px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 40px",
        position: "relative",
      }}
    >
      <div className="cg-soft-glow" aria-hidden />

      <p className="cg-fade-up" style={{ ...eyebrowStyle, animationDelay: "80ms" }}>
        Content Guide
      </p>
      <h1
        className="cg-fade-up"
        style={{
          fontSize: "clamp(24px, 3.5vw, 40px)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1.3,
          textAlign: "center",
          marginBottom: "14px",
          wordBreak: "keep-all",
          animationDelay: "160ms",
        }}
      >
        콘텐츠 레퍼런스를 분석하고 있습니다
      </h1>
      <p
        key={step}
        className="cg-status-swap"
        style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.45)",
          marginBottom: "56px",
          textAlign: "center",
          minHeight: "1.4em",
        }}
      >
        {ANALYZE_STEPS[step]?.status}
      </p>

      <div
        className="cg-fade-up"
        style={{ width: "100%", maxWidth: "520px", animationDelay: "280ms" }}
      >
        <div
          style={{
            height: "3px",
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: "9999px",
            overflow: "hidden",
            marginBottom: "18px",
          }}
        >
          <div
            className="cg-progress-fill"
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: "#fff",
              borderRadius: "9999px",
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${ANALYZE_STEPS.length}, 1fr)`,
            gap: "8px",
          }}
        >
          {ANALYZE_STEPS.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <p
                key={s.label}
                style={{
                  fontSize: "12px",
                  textAlign: "center",
                  fontWeight: active || done ? 700 : 500,
                  color:
                    active || done
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.28)",
                  transform: active ? "translateY(-1px)" : "none",
                  transition: `color 0.7s ${EASE}, font-weight 0.7s ${EASE}, transform 0.7s ${EASE}`,
                }}
              >
                {s.label}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ListView({
  meta,
  visibleCount,
  prevVisibleCount,
  expandedId,
  onExpand,
  onCollapse,
  onLoadMore,
}: {
  meta: ContentGuideMeta;
  visibleCount: number;
  prevVisibleCount: number;
  expandedId: string | null;
  onExpand: (id: string) => void;
  onCollapse: () => void;
  onLoadMore: () => void;
}) {
  const visible = meta.guides.slice(0, visibleCount);
  const hasMore = visibleCount < meta.guides.length;

  return (
    <div
      className="cg-phase-in"
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "56px 24px 96px",
      }}
    >
      <div
        className="cg-fade-up"
        style={{ textAlign: "center", marginBottom: "48px", animationDelay: "60ms" }}
      >
        <p style={eyebrowStyle}>Content Guide</p>
        <h1
          style={{
            fontSize: "clamp(24px, 3.2vw, 36px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.3,
            marginBottom: "12px",
            wordBreak: "keep-all",
          }}
        >
          {meta.listTitle}
        </h1>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.16em",
          }}
        >
          {meta.guides.length} GUIDES
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {visible.map((guide, i) => {
          const isNew = i >= prevVisibleCount;
          const staggerIndex = isNew ? i - prevVisibleCount : i;
          const delayMs =
            (isNew ? 40 : 120) + staggerIndex * (isNew ? 70 : 90);
          return (
            <div
              key={guide.id}
              className="cg-fade-up"
              style={{ animationDelay: `${delayMs}ms` }}
            >
              <GuideCard
                guide={guide}
                expanded={expandedId === guide.id}
                onExpand={() => onExpand(guide.id)}
                onCollapse={onCollapse}
              />
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div
          className="cg-fade-up"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "36px",
            animationDelay: `${120 + visible.length * 70}ms`,
          }}
        >
          <button
            type="button"
            onClick={onLoadMore}
            className="cg-pill"
            style={loadMoreStyle}
          >
            가이드 더 보기 - {visibleCount}/{meta.guides.length}
          </button>
        </div>
      )}
    </div>
  );
}

function GuideCard({
  guide,
  expanded,
  onExpand,
  onCollapse,
}: {
  guide: ContentGuideItem;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  if (expanded) {
    return <ExpandedGuide guide={guide} onCollapse={onCollapse} />;
  }

  return (
    <div
      className="cg-card"
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <GuideThumb guide={guide} />
      <div
        style={{
          flex: "1 1 220px",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            marginBottom: "10px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.35,
              margin: 0,
              wordBreak: "keep-all",
            }}
          >
            <span
              style={{ color: "rgba(255,255,255,0.35)", marginRight: "8px" }}
            >
              {String(guide.index).padStart(2, "0")}
            </span>
            {guide.title}
          </h2>
        </div>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.7,
            margin: "0 0 18px",
            wordBreak: "keep-all",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {guide.summary}
        </p>
        <div
          style={{
            marginTop: "auto",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            type="button"
            onClick={onExpand}
            className="cg-link"
            style={linkBtnStyle}
          >
            가이드 자세히 보기
            <span className="cg-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ExpandedGuide({
  guide,
  onCollapse,
}: {
  guide: ContentGuideItem;
  onCollapse: () => void;
}) {
  const stacked = guide.description.length > LONG_TEXT_THRESHOLD;

  return (
    <div
      className="cg-expand"
      style={{
        ...cardStyle,
        flexDirection: "column",
        gap: "28px",
        padding: "28px",
      }}
    >
      {stacked ? (
        <>
          <ExpandedHeader guide={guide} />
          <p className="cg-fade-up" style={{ ...bodyTextStyle, animationDelay: "80ms" }}>
            {guide.summary}
          </p>
          <div className="cg-fade-up" style={{ animationDelay: "140ms" }}>
            <VideoPlaceholder
              duration={guide.videoDuration}
              videoUrl={guide.videoUrl}
              fullWidth
            />
          </div>
          <div className="cg-fade-up" style={{ animationDelay: "220ms" }}>
            <DetailSections guide={guide} />
          </div>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "28px",
            alignItems: "stretch",
            flexWrap: "wrap",
          }}
        >
          <div className="cg-fade-up" style={{ animationDelay: "60ms" }}>
            <VideoPlaceholder
              duration={guide.videoDuration}
              videoUrl={guide.videoUrl}
            />
          </div>
          <div
            className="cg-fade-up"
            style={{ flex: "1 1 280px", minWidth: 0, animationDelay: "140ms" }}
          >
            <ExpandedHeader guide={guide} />
            <DetailSections guide={guide} />
          </div>
        </div>
      )}

      <div
        className="cg-fade-up"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "8px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          animationDelay: "280ms",
        }}
      >
        <button
          type="button"
          onClick={onCollapse}
          className="cg-link"
          style={linkBtnStyle}
        >
          접기
          <span className="cg-arrow">↑</span>
        </button>
      </div>
    </div>
  );
}

function ExpandedHeader({ guide }: { guide: ContentGuideItem }) {
  return (
    <h2
      style={{
        fontSize: "clamp(20px, 2.4vw, 26px)",
        fontWeight: 900,
        letterSpacing: "-0.03em",
        lineHeight: 1.35,
        margin: "0 0 20px",
        wordBreak: "keep-all",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.35)", marginRight: "10px" }}>
        {String(guide.index).padStart(2, "0")}
      </span>
      {guide.title}
    </h2>
  );
}

function DetailSections({ guide }: { guide: ContentGuideItem }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <Section label="Concept" body={guide.concept} />
      <Section label="Description" body={guide.description} />
      <div>
        <p style={sectionLabelStyle}>Matched Caption</p>
        <div
          style={{
            marginTop: "10px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "16px 18px",
            whiteSpace: "pre-line",
            fontSize: "14px",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.78)",
            wordBreak: "keep-all",
          }}
        >
          {guide.matchedCaption}
        </div>
      </div>
    </div>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p style={sectionLabelStyle}>{label}</p>
      <p style={{ ...bodyTextStyle, marginTop: "8px", whiteSpace: "pre-line" }}>{body}</p>
    </div>
  );
}

function VideoPlaceholder({
  duration,
  videoUrl,
  fullWidth,
}: {
  duration: string;
  videoUrl?: string;
  fullWidth?: boolean;
}) {
  const boxStyle: CSSProperties = {
    width: fullWidth ? "100%" : "320px",
    flexShrink: 0,
    minHeight: fullWidth ? "420px" : "520px",
    height: fullWidth ? "520px" : "520px",
    borderRadius: "16px",
    background:
      "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  if (videoUrl) {
    return (
      <div style={boxStyle}>
        <iframe
          src={videoUrl}
          title="Reference video"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <p
          style={{
            position: "absolute",
            left: "16px",
            bottom: "14px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.55)",
            textTransform: "uppercase",
            margin: 0,
            pointerEvents: "none",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}
        >
          Reference Video
        </p>
      </div>
    );
  }

  return (
    <div style={boxStyle}>
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ marginLeft: "3px", fontSize: "18px", color: "#fff" }}>
          ▶
        </span>
      </div>
      <p
        style={{
          position: "absolute",
          left: "16px",
          bottom: "14px",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.45)",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Reference Video · {duration}
      </p>
    </div>
  );
}

function GuideThumb({ guide }: { guide: ContentGuideItem }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const postUrl = guide.videoUrl?.replace(/\/embed\/?$/, "/") ?? "";
  const src =
    !failed && postUrl
      ? `/api/content-guide/thumb?url=${encodeURIComponent(postUrl)}`
      : null;

  return (
    <div
      style={{
        width: "132px",
        height: "168px",
        flexShrink: 0,
        borderRadius: "14px",
        overflow: "hidden",
        position: "relative",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "scale(1)" : "scale(1.04)",
            transition: `opacity 0.7s ${EASE}, transform 0.9s ${EASE}`,
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12), transparent 55%), linear-gradient(160deg, #1a1a1a, #0a0a0a)",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.08em",
            }}
          >
            {String(guide.index).padStart(2, "0")}
          </span>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 45%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

const MOTION_CSS = `
  @keyframes cgFadeUp {
    from { opacity: 0; transform: translateY(18px); filter: blur(2px); }
    to   { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  @keyframes cgFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes cgPhaseIn {
    from { opacity: 0; transform: translateY(22px) scale(0.992); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cgPhaseOut {
    from { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    to   { opacity: 0; transform: translateY(-12px) scale(0.985); filter: blur(3px); }
  }
  @keyframes cgStatusSwap {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cgExpand {
    from { opacity: 0; transform: translateY(10px) scale(0.985); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cgPulseGlow {
    0%, 100% { opacity: 0.35; transform: translate(-50%, -50%) scale(1); }
    50%      { opacity: 0.55; transform: translate(-50%, -50%) scale(1.08); }
  }
  .cg-fade-up {
    opacity: 0;
    animation: cgFadeUp 0.85s ${EASE} both;
  }
  .cg-fade-in {
    opacity: 0;
    animation: cgFadeIn 0.7s ${EASE} both;
  }
  .cg-phase-in {
    animation: cgPhaseIn 0.9s ${EASE} both;
  }
  .cg-phase-out {
    animation: cgPhaseOut ${PHASE_OUT_MS}ms ${EASE} both;
    pointer-events: none;
  }
  .cg-status-swap {
    animation: cgStatusSwap 0.65s ${EASE} both;
  }
  .cg-expand {
    animation: cgExpand 0.65s ${EASE} both;
  }
  .cg-progress-fill {
    transition: width 1.1s ${EASE};
  }
  .cg-card {
    transition: background-color 0.45s ${EASE}, border-color 0.45s ${EASE}, transform 0.45s ${EASE}, box-shadow 0.45s ${EASE};
    will-change: transform;
  }
  .cg-link {
    transition: color 0.35s ${EASE};
  }
  .cg-link:hover {
    color: #fff !important;
  }
  .cg-arrow {
    display: inline-block;
    transition: transform 0.35s ${EASE};
  }
  .cg-link:hover .cg-arrow {
    transform: translateX(3px);
  }
  .cg-pill {
    transition: background 0.4s ${EASE}, border-color 0.4s ${EASE}, transform 0.4s ${EASE};
  }
  .cg-pill:hover {
    background: rgba(255,255,255,0.07) !important;
    border-color: rgba(255,255,255,0.55) !important;
    transform: translateY(-1px);
  }
  .cg-soft-glow {
    position: absolute;
    width: 420px;
    height: 420px;
    left: 50%;
    top: 42%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 68%);
    pointer-events: none;
    animation: cgPulseGlow 3.6s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .cg-fade-up, .cg-fade-in, .cg-phase-in, .cg-phase-out,
    .cg-status-swap, .cg-expand, .cg-soft-glow {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
    }
    .cg-progress-fill, .cg-card, .cg-link, .cg-pill, .cg-arrow {
      transition: none !important;
    }
  }
`;

const eyebrowStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  color: "rgba(255,255,255,0.35)",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  marginBottom: "16px",
};

const cardStyle: CSSProperties = {
  display: "flex",
  gap: "24px",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "18px",
  padding: "22px",
  alignItems: "stretch",
  flexWrap: "wrap",
};

const sectionLabelStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  color: "rgba(255,255,255,0.35)",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  margin: 0,
};

const bodyTextStyle: CSSProperties = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.65)",
  lineHeight: 1.75,
  margin: 0,
  wordBreak: "keep-all",
};

const linkBtnStyle: CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  color: "rgba(255,255,255,0.75)",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

const loadMoreStyle: CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.35)",
  color: "#fff",
  borderRadius: "9999px",
  padding: "14px 28px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

const backBtnStyle: CSSProperties = {
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: "9999px",
  padding: "12px 24px",
  fontWeight: 700,
  cursor: "pointer",
};
