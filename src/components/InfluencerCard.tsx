"use client";

import Image from "next/image";
import { Play, Camera, Music, Users, Calendar } from "lucide-react";
import { Campaign } from "@/lib/types";

interface InfluencerCardProps {
  campaign: Campaign;
  onSlotClick: (campaignId: string, slotId: number) => void;
  onFilterCountry?: (country: "us" | "jp" | "cn") => void;
  onFilterPlatform?: (platform: "youtube" | "instagram" | "tiktok" | "xiaohongshu") => void;
  onFilterMonth?: (month: string) => void;
}

const PlatformIcon = ({ platform, size = 14 }: { platform: string; size?: number }) => {
  if (platform === "youtube") return <Play size={size} color="#ff0000" />;
  if (platform === "instagram") return <Camera size={size} color="#e1306c" />;
  if (platform === "tiktok") return <Music size={size} color="#010101" />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ff2442">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
    </svg>
  );
};

const PlatformLabel: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  xiaohongshu: "Xiaohongshu",
};

const PlatformColor: Record<string, string> = {
  youtube: "#ff0000",
  instagram: "#e1306c",
  tiktok: "#111111",
  xiaohongshu: "#ff2442",
};

const countryInfo: Record<string, { label: string; bg: string; border: string; color: string }> = {
  us: { label: "US", bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" },
  jp: { label: "JAPAN",         bg: "#fff1f2", border: "#fecdd3", color: "#e11d48" },
  cn: { label: "CHINA",         bg: "#fff7ed", border: "#fed7aa", color: "#ea580c" },
};

export default function InfluencerCard({
  campaign,
  onSlotClick,
  onFilterCountry,
  onFilterPlatform,
  onFilterMonth,
}: InfluencerCardProps) {
  const { influencer, slots } = campaign;
  const country = countryInfo[campaign.country];
  const availableCount = slots.filter((s) => s.status === "available").length;
  const shootingMonth = campaign.shootingDate.slice(0, 7);

  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* ── Cover thumbnail area ── */}
      <div style={{ position: "relative", height: "360px", backgroundColor: "#f3f4f6" }}>
        <Image
          src={influencer.thumbnailUrl}
          alt={influencer.name}
          fill
          style={{ objectFit: "cover" }}
        />
        {/* Dark gradient overlay — pointer-events off so clicks reach the link below */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* Clickable overlay linking to influencer profile */}
        <a
          href={influencer.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ position: "absolute", inset: 0, zIndex: 2, cursor: "pointer" }}
          aria-label={`${influencer.name} 프로필 보기`}
        />

        {/* Country badge — top right */}
        <div
          onClick={() => onFilterCountry?.(campaign.country)}
          title={`${country.label} 필터`}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 3,
            padding: "4px 10px",
            backgroundColor: "rgba(255,255,255,0.92)",
            border: `1px solid ${country.border}`,
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            color: country.color,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: onFilterCountry ? "pointer" : "default",
            backdropFilter: "blur(4px)",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { if (onFilterCountry) e.currentTarget.style.opacity = "0.75"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {country.label}
        </div>

        {/* Name + handle overlay — bottom left */}
        <div style={{ position: "absolute", bottom: "12px", left: "16px", right: "16px", zIndex: 3, pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <span style={{ fontSize: "18px", fontWeight: "800", color: "#fff", lineHeight: 1, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
              {influencer.name}
            </span>
            <PlatformIcon platform={influencer.platform} size={14} />
          </div>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{influencer.handle}</span>
        </div>
      </div>

      {/* ── Profile info row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 12px",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        {/* Follower count */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <Users size={15} color="#9ca3af" />
          <span style={{ fontSize: "19px", fontWeight: "700", color: "#111" }}>
            {influencer.followers}
          </span>
          <span style={{ fontSize: "14px", color: "#9ca3af" }}>팔로워</span>
          {influencer.platform === "xiaohongshu" && influencer.likesAndSaves && (
            <>
              <span style={{ fontSize: "14px", color: "#e5e7eb" }}>·</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#ff2442" }}>
                {influencer.likesAndSaves}
              </span>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>좋아요·저장</span>
            </>
          )}
        </div>

        {/* Platform tag */}
        <span
          onClick={() => onFilterPlatform?.(influencer.platform)}
          title={`${PlatformLabel[influencer.platform]} 필터`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            fontWeight: "600",
            color: PlatformColor[influencer.platform],
            backgroundColor: `${PlatformColor[influencer.platform]}10`,
            border: `1px solid ${PlatformColor[influencer.platform]}30`,
            padding: "4px 10px",
            borderRadius: "20px",
            cursor: onFilterPlatform ? "pointer" : "default",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { if (onFilterPlatform) e.currentTarget.style.opacity = "0.7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <PlatformIcon platform={influencer.platform} size={11} />
          {PlatformLabel[influencer.platform]}
        </span>
      </div>

      {/* ── Content title + dates ── */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
        <p style={{ fontSize: "19px", color: "#111", fontWeight: "800", lineHeight: "1.4", marginBottom: "12px", letterSpacing: "-0.02em", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "53px" }}>
          {campaign.contentTitle}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <DateChip icon={<Calendar size={11} />} label="모집 마감" date={campaign.recruitDeadline} accent="#dc2626" />
          <DateChip icon={<Calendar size={11} />} label="촬영일"   date={campaign.shootingDate} onClick={() => onFilterMonth?.(shootingMonth)} clickable={!!onFilterMonth} />
          <DateChip icon={<Calendar size={11} />} label="게시일"   date={campaign.publishDate} />
        </div>
      </div>

      {/* ── Slots ── */}
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "500" }}>
            슬롯 현황 — {availableCount}/{campaign.totalSlots} 남음
          </span>
          <span style={{ fontSize: "16px", color: "#111", fontWeight: "700" }}>
            {(campaign.perSlotCost / 10000).toLocaleString("ko-KR")}만원
            <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "400" }}>/슬롯</span>
          </span>
        </div>

        <div style={{ display: "flex", gap: "5px" }}>
          {slots.map((slot) => {
            const isAvailable = slot.status === "available";
            const isReserved = slot.status === "reserved";
            const isFilled = slot.status === "filled";

            return (
              <button
                key={slot.id}
                onClick={() => onSlotClick(campaign.id, slot.id)}
                title={isFilled ? slot.brandName || "마감 — 클릭하여 가이드 보기" : isReserved ? slot.brandName || "협의 중" : "클릭하여 신청"}
                style={{
                  flex: 1,
                  padding: "9px 4px",
                  backgroundColor: isFilled ? "#f9fafb" : isReserved ? "#fffbeb" : "#f0fdf4",
                  border: `1.5px solid ${isFilled ? "#e5e7eb" : isReserved ? "#fde68a" : "#86efac"}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (isAvailable) {
                    e.currentTarget.style.backgroundColor = "#dcfce7";
                    e.currentTarget.style.borderColor = "#4ade80";
                  } else {
                    e.currentTarget.style.opacity = "0.7";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isAvailable) {
                    e.currentTarget.style.backgroundColor = "#f0fdf4";
                    e.currentTarget.style.borderColor = "#86efac";
                  } else {
                    e.currentTarget.style.opacity = "1";
                  }
                }}
              >
                <span style={{ fontSize: "12px", color: isFilled ? "#d1d5db" : isReserved ? "#d97706" : "#16a34a", fontWeight: "700" }}>
                  #{slot.id}
                </span>
                <span style={{ fontSize: "11px", color: isFilled ? "#d1d5db" : isReserved ? "#b45309" : "#15803d" }}>
                  {isFilled ? "마감" : isReserved ? "검토" : "신청"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: "0 16px 16px" }}>
        <button
          onClick={() => {
            const first = slots.find((s) => s.status === "available") ?? slots[0];
            if (first) onSlotClick(campaign.id, first.id);
          }}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: availableCount > 0 ? "#111" : "transparent",
            border: availableCount > 0 ? "none" : "1px solid #e5e7eb",
            borderRadius: "8px",
            color: availableCount > 0 ? "#fff" : "#9ca3af",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            letterSpacing: "0.02em",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (availableCount > 0) e.currentTarget.style.backgroundColor = "#374151";
            else { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#6b7280"; }
          }}
          onMouseLeave={(e) => {
            if (availableCount > 0) e.currentTarget.style.backgroundColor = "#111";
            else { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#9ca3af"; }
          }}
        >
          {availableCount > 0 ? "탑승 신청 →" : "콘텐츠 가이드 보기"}
        </button>
      </div>
    </div>
  );
}

function DateChip({
  icon,
  label,
  date,
  onClick,
  clickable,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  date: string;
  onClick?: () => void;
  clickable?: boolean;
  accent?: string;
}) {
  return (
    <div
      onClick={onClick}
      title={clickable ? `${date.slice(0, 7)} 월 필터` : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        cursor: clickable ? "pointer" : "default",
        padding: "4px 8px",
        borderRadius: "6px",
        backgroundColor: accent ? `${accent}08` : "transparent",
        border: accent ? `1px solid ${accent}25` : "1px solid transparent",
        transition: "background-color 0.15s",
        width: "fit-content",
      }}
      onMouseEnter={(e) => { if (clickable && !accent) e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
      onMouseLeave={(e) => { if (clickable && !accent) e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      <span style={{ color: accent ?? "#d1d5db" }}>{icon}</span>
      <span style={{ fontSize: "13px", color: accent ?? "#9ca3af", fontWeight: accent ? "600" : "400", minWidth: "58px" }}>{label}</span>
      <span style={{ fontSize: "13px", color: accent ?? (clickable ? "#374151" : "#6b7280"), fontWeight: "600" }}>{date}</span>
    </div>
  );
}
