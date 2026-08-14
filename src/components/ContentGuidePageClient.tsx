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
const STEP_MS = 1400;
const LONG_TEXT_THRESHOLD = 160;

interface ContentGuidePageClientProps {
  serviceId: string;
}

export default function ContentGuidePageClient({
  serviceId,
}: ContentGuidePageClientProps) {
  const router = useRouter();
  const meta = CONTENT_GUIDES[serviceId];
  const [phase, setPhase] = useState<"analyzing" | "list">("analyzing");
  const [step, setStep] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setPhase("analyzing");
    setStep(0);
    setVisibleCount(PAGE_SIZE);
    setExpandedId(null);

    const timers: ReturnType<typeof setTimeout>[] = [];
    ANALYZE_STEPS.forEach((_, i) => {
      if (i === 0) return;
      timers.push(setTimeout(() => setStep(i), STEP_MS * i));
    });
    timers.push(
      setTimeout(() => setPhase("list"), STEP_MS * ANALYZE_STEPS.length)
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
      }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 28px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
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

      {phase === "analyzing" ? (
        <AnalyzingView step={step} />
      ) : (
        <ListView
          meta={meta}
          visibleCount={visibleCount}
          expandedId={expandedId}
          onExpand={(id) => setExpandedId(id)}
          onCollapse={() => setExpandedId(null)}
          onLoadMore={() =>
            setVisibleCount((n) => Math.min(n + PAGE_SIZE, meta.guides.length))
          }
        />
      )}
    </main>
  );
}

function AnalyzingView({ step }: { step: number }) {
  const progress = ((step + 1) / ANALYZE_STEPS.length) * 100;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 65px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 40px",
        animation: "fadeSlideIn 0.4s ease both",
      }}
    >
      <p style={eyebrowStyle}>Content Guide</p>
      <h1
        style={{
          fontSize: "clamp(24px, 3.5vw, 40px)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1.3,
          textAlign: "center",
          marginBottom: "14px",
          wordBreak: "keep-all",
        }}
      >
        콘텐츠 레퍼런스를 분석하고 있습니다
      </h1>
      <p
        style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.45)",
          marginBottom: "56px",
          textAlign: "center",
        }}
      >
        {ANALYZE_STEPS[step]?.status}
      </p>

      <div style={{ width: "100%", maxWidth: "520px" }}>
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
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: "#fff",
              borderRadius: "9999px",
              transition: "width 0.6s ease",
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
                  transition: "color 0.3s",
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
  expandedId,
  onExpand,
  onCollapse,
  onLoadMore,
}: {
  meta: ContentGuideMeta;
  visibleCount: number;
  expandedId: string | null;
  onExpand: (id: string) => void;
  onCollapse: () => void;
  onLoadMore: () => void;
}) {
  const visible = meta.guides.slice(0, visibleCount);
  const hasMore = visibleCount < meta.guides.length;

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "56px 24px 96px",
        animation: "fadeSlideIn 0.5s ease both",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
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
        {visible.map((guide) => (
          <GuideCard
            key={guide.id}
            guide={guide}
            expanded={expandedId === guide.id}
            onExpand={() => onExpand(guide.id)}
            onCollapse={onCollapse}
          />
        ))}
      </div>

      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "36px" }}>
          <button type="button" onClick={onLoadMore} style={loadMoreStyle}>
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
    <div style={cardStyle}>
      <div style={thumbStyle} />
      <div style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column" }}>
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
            <span style={{ color: "rgba(255,255,255,0.35)", marginRight: "8px" }}>
              {guide.code || String(guide.index).padStart(2, "0")}
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
          <button type="button" onClick={onExpand} style={linkBtnStyle}>
            가이드 자세히 보기
            <span>→</span>
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
      style={{
        ...cardStyle,
        flexDirection: "column",
        gap: "28px",
        padding: "28px",
        animation: "fadeSlideIn 0.35s ease both",
      }}
    >
      {stacked ? (
        <>
          <ExpandedHeader guide={guide} />
          <p style={bodyTextStyle}>{guide.summary}</p>
          <VideoPlaceholder
            duration={guide.videoDuration}
            videoUrl={guide.videoUrl}
            fullWidth
          />
          <DetailSections guide={guide} />
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
          <VideoPlaceholder
            duration={guide.videoDuration}
            videoUrl={guide.videoUrl}
          />
          <div style={{ flex: "1 1 280px", minWidth: 0 }}>
            <ExpandedHeader guide={guide} />
            <DetailSections guide={guide} />
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "8px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button type="button" onClick={onCollapse} style={linkBtnStyle}>
          접기
          <span>↑</span>
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
        {guide.code || String(guide.index).padStart(2, "0")}
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
      <p style={{ ...bodyTextStyle, marginTop: "8px" }}>{body}</p>
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
        <span style={{ marginLeft: "3px", fontSize: "18px", color: "#fff" }}>▶</span>
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

const thumbStyle: CSSProperties = {
  width: "120px",
  minHeight: "150px",
  flexShrink: 0,
  borderRadius: "12px",
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
  border: "1px solid rgba(255,255,255,0.06)",
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
