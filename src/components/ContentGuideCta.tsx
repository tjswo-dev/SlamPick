"use client";

import { useRouter } from "next/navigation";

interface ContentGuideCtaProps {
  serviceId: string;
  subtitle: string;
  guideCount: number;
}

export default function ContentGuideCta({
  serviceId,
  subtitle,
  guideCount,
}: ContentGuideCtaProps) {
  const router = useRouter();

  return (
    <div
      style={{
        marginTop: "48px",
        textAlign: "center",
        padding: "56px 40px 8px",
        animation: "fadeSlideIn 0.5s ease both",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom: "18px",
        }}
      >
        Content Guide
      </p>
      <h3
        style={{
          fontSize: "clamp(26px, 3.2vw, 40px)",
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "-0.04em",
          lineHeight: 1.25,
          marginBottom: "14px",
          wordBreak: "keep-all",
        }}
      >
        실제 레퍼런스에서 발견한
        <br />
        {guideCount}가지 콘텐츠 방향
      </h3>
      <p
        style={{
          fontSize: "15px",
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.7,
          marginBottom: "36px",
          wordBreak: "keep-all",
        }}
      >
        {subtitle}
      </p>
      <button
        type="button"
        onClick={() => router.push(`/content-guide/${serviceId}`)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          background: "#fff",
          color: "#000",
          border: "none",
          borderRadius: "9999px",
          padding: "16px 32px",
          fontSize: "15px",
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: "-0.01em",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.88";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        콘텐츠 가이드 분석하기
        <span style={{ fontSize: "16px", lineHeight: 1 }}>→</span>
      </button>
    </div>
  );
}
