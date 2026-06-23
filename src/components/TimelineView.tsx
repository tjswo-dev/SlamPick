"use client";

import { useMemo } from "react";
import { Campaign } from "@/lib/types";
import InfluencerCard from "./InfluencerCard";

interface TimelineViewProps {
  campaigns: Campaign[];
  onSlotClick: (campaignId: string, slotId: number) => void;
  onFilterCountry?: (country: "us" | "jp" | "cn") => void;
  onFilterPlatform?: (platform: "youtube" | "instagram" | "tiktok" | "xiaohongshu") => void;
  onFilterMonth?: (month: string) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    month: d.getMonth() + 1,
    day: d.getDate(),
    weekday: ["일", "월", "화", "수", "목", "금", "토"][d.getDay()],
  };
}

const COLS = 3;
const COL_HALF = `${(1 / (COLS * 2)) * 100}%`;

export default function TimelineView({ campaigns, onSlotClick, onFilterCountry, onFilterPlatform, onFilterMonth }: TimelineViewProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, Campaign[]>();
    for (const c of campaigns) {
      if (!map.has(c.shootingDate)) map.set(c.shootingDate, []);
      map.get(c.shootingDate)!.push(c);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({ date, items }));
  }, [campaigns]);

  if (grouped.length === 0) {
    return (
      <div
        style={{
          padding: "80px",
          textAlign: "center",
          color: "#d1d5db",
          border: "1px dashed #e5e7eb",
          borderRadius: "12px",
          backgroundColor: "#fff",
        }}
      >
        <p style={{ fontSize: "14px" }}>검색 결과가 없습니다</p>
      </div>
    );
  }

  const rows: (typeof grouped)[] = [];
  for (let i = 0; i < grouped.length; i += COLS) {
    rows.push(grouped.slice(i, i + COLS));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
      {rows.map((row, rowIdx) => {
        const hasNextRow = rowIdx < rows.length - 1;
        return (
          <div key={rowIdx} style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: "64px",
                left: rowIdx === 0 ? COL_HALF : "0",
                right: hasNextRow ? "0" : COL_HALF,
                height: "2px",
                backgroundColor: "#e5e7eb",
                zIndex: 0,
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gap: "20px",
                position: "relative",
                zIndex: 1,
              }}
            >
              {row.map(({ date, items }) => {
                const { month, day, weekday } = formatDate(date);
                const isWeekend = weekday === "토" || weekday === "일";
                return (
                  <div key={date} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#6b7280",
                        letterSpacing: "0.06em",
                        marginBottom: "3px",
                      }}
                    >
                      {month}월
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginBottom: "12px" }}>
                      <span
                        style={{
                          fontSize: "26px",
                          fontWeight: "800",
                          lineHeight: 1,
                          color: isWeekend ? "#dc2626" : "#111",
                        }}
                      >
                        {day}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: isWeekend ? "#dc2626" : "#9ca3af",
                        }}
                      >
                        {weekday}
                      </span>
                    </div>
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "#111",
                        border: "3px solid #f8f9fb",
                        boxShadow: "0 0 0 2px #111",
                        marginBottom: "14px",
                        flexShrink: 0,
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        width: "1px",
                        height: "14px",
                        backgroundColor: "#d1d5db",
                        marginBottom: "10px",
                      }}
                    />
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {items.map((c) => (
                        <InfluencerCard
                          key={c.id}
                          campaign={c}
                          onSlotClick={onSlotClick}
                          onFilterCountry={onFilterCountry}
                          onFilterPlatform={onFilterPlatform}
                          onFilterMonth={onFilterMonth}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              {row.length < COLS &&
                Array.from({ length: COLS - row.length }).map((_, i) => <div key={`e-${i}`} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
