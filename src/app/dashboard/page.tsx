"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";
import SlotModal from "@/components/SlotModal";
import TimelineView from "@/components/TimelineView";
import { fetchCampaigns } from "@/lib/db";
import { Campaign, BrandApplication } from "@/lib/types";

type FilterPlatform = "all" | "youtube" | "instagram" | "tiktok" | "xiaohongshu";
type FilterCountry = "all" | "us" | "jp" | "cn";
type FilterMonth = "all" | "2026-06" | "2026-07" | "2026-08" | "2026-09" | "2026-10" | "2026-11" | "2026-12";

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string>("");

  useEffect(() => {
    fetchCampaigns().then((data) => {
      setCampaigns(data);
      setDbLoading(false);
    }).catch((e) => {
      setDbError(String(e));
      setDbLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };
  const [selectedSlot, setSelectedSlot] = useState<{ campaignId: string; slotId: number } | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<FilterPlatform>("all");
  const [filterCountry, setFilterCountry] = useState<FilterCountry>("all");
  const [filterMonth, setFilterMonth] = useState<FilterMonth>("all");

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (filterPlatform !== "all" && c.influencer.platform !== filterPlatform) return false;
      if (filterCountry !== "all" && c.country !== filterCountry) return false;
      if (filterMonth !== "all" && !c.shootingDate.startsWith(filterMonth)) return false;
      return true;
    });
  }, [campaigns, filterPlatform, filterCountry, filterMonth]);

  const selectedCampaign = selectedSlot
    ? campaigns.find((c) => c.id === selectedSlot.campaignId)
    : null;

  const handleApplication = async (application: BrandApplication) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const targetSlotIds = application.slotIds ?? [application.slotId];

    // 슬롯별 처리
    for (const slotNumber of targetSlotIds) {
      const { data: slotRow } = await supabase
        .from("slots")
        .select("id")
        .eq("campaign_id", application.campaignId)
        .eq("slot_number", slotNumber)
        .single();

      if (!slotRow) continue;

      await supabase.from("applications").insert({
        campaign_id: application.campaignId,
        slot_id: slotRow.id,
        user_id: user.id,
        company_name: application.companyName,
        brand_name: application.brandName,
        product_name: application.productName,
        product_url: application.productUrl || null,
        product_description: application.productDescription || null,
        exposure_point: application.exposurePoint || null,
        reference_video_url: application.referenceVideoUrl || null,
        precautions: application.precautions || null,
        contact_name: application.contactName,
        contact_email: application.contactEmail,
        contact_phone: application.contactPhone,
      });

      await supabase
        .from("slots")
        .update({ status: "reserved", brand_name: application.brandName })
        .eq("id", slotRow.id);
    }

    // 로컬 상태 갱신
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id !== application.campaignId ? c : {
          ...c,
          slots: c.slots.map((s) =>
            targetSlotIds.includes(s.id)
              ? { ...s, status: "reserved" as const, brandName: application.brandName }
              : s
          ),
        }
      )
    );
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fb", color: "#111" }}>
      {/* Top Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          zIndex: 100,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          height: "60px",
          gap: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "900",
            color: "#111",
            letterSpacing: "-0.04em",
            cursor: "pointer",
          }}
          onClick={() => router.push("/dashboard")}
        >
          SLAM PICK
        </h1>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => router.push("/mypage")}
          style={{
            padding: "7px 24px",
            backgroundColor: "transparent",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            color: "#6b7280",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.15s",
            marginRight: "16px",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#374151"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
        >
          My Dashboard
        </button>

        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "13px",
          }}
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </nav>

      {/* Main content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 28px" }}>
        {dbLoading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af", fontSize: "14px" }}>
            캠페인 불러오는 중...
          </div>
        )}
        {dbError && (
          <div style={{ textAlign: "center", padding: "20px", color: "#dc2626", fontSize: "13px", backgroundColor: "#fef2f2", borderRadius: "8px", marginBottom: "16px" }}>
            오류: {dbError}
          </div>
        )}
        {!dbLoading && !dbError && campaigns.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af", fontSize: "14px" }}>
            등록된 캠페인이 없습니다
          </div>
        )}
        {!dbLoading && (<>
        {/* Page Header */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: "900",
              color: "#111",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "10px",
            }}
          >
            MEGA INFLUENCER CAMPAIGN
          </h2>
          <p style={{ fontSize: "14px", color: "#9ca3af" }}>
            빈 슬롯을 클릭하여 브랜드 탑승 신청을 시작하세요
          </p>
        </div>

        {/* Filters */}
        <div
          style={{
            marginBottom: "24px",
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Row 1: Platform */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#9ca3af",
                letterSpacing: "0.06em",
                minWidth: "72px",
                flexShrink: 0,
                paddingRight: "12px",
                borderRight: "1px solid #e5e7eb",
                marginRight: "4px",
              }}
            >
              PLATFORM
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", flex: 1 }}>
              {(["all", "youtube", "instagram", "tiktok", "xiaohongshu"] as FilterPlatform[]).map((p) => (
                <FilterButton
                  key={p}
                  label={
                    p === "all" ? "ALL"
                    : p === "youtube" ? "YouTube"
                    : p === "instagram" ? "Instagram"
                    : p === "tiktok" ? "TikTok"
                    : "Xiaohongshu"
                  }
                  active={filterPlatform === p}
                  onClick={() => setFilterPlatform(p)}
                  accent={p === "xiaohongshu" ? "#ff2442" : undefined}
                />
              ))}
            </div>
          </div>

          {/* Row 3: Country */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#9ca3af",
                letterSpacing: "0.06em",
                minWidth: "72px",
                flexShrink: 0,
                paddingRight: "12px",
                borderRight: "1px solid #e5e7eb",
                marginRight: "4px",
              }}
            >
              COUNTRY
            </span>
            <div style={{ display: "flex", gap: "6px", flex: 1 }}>
              {(["all", "us", "jp", "cn"] as FilterCountry[]).map((c) => (
                <FilterButton
                  key={c}
                  label={c === "all" ? "ALL" : c === "us" ? "US" : c === "jp" ? "JAPAN" : "CHINA"}
                  active={filterCountry === c}
                  onClick={() => setFilterCountry(c)}
                />
              ))}
            </div>
          </div>

          {/* Row 4: Month dropdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderTop: "1px solid #f3f4f6",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#9ca3af",
                letterSpacing: "0.06em",
                minWidth: "72px",
                flexShrink: 0,
                paddingRight: "12px",
                borderRight: "1px solid #e5e7eb",
                marginRight: "4px",
              }}
            >
              MONTH
            </span>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value as FilterMonth)}
              style={{
                appearance: "none",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "6px 32px 6px 12px",
                fontSize: "13px",
                color: "#374151",
                cursor: "pointer",
                outline: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                fontFamily: "inherit",
              }}
            >
              <option value="all">ALL</option>
              <option value="2026-06">Jun 2026</option>
              <option value="2026-07">Jul 2026</option>
              <option value="2026-08">Aug 2026</option>
              <option value="2026-09">Sep 2026</option>
              <option value="2026-10">Oct 2026</option>
              <option value="2026-11">Nov 2026</option>
              <option value="2026-12">Dec 2026</option>
            </select>
            <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "auto" }}>
              {filteredCampaigns.length} campaigns
            </span>
          </div>
        </div>

        {/* Timeline */}
        <TimelineView
          campaigns={filteredCampaigns}
          onSlotClick={(campaignId, slotId) => setSelectedSlot({ campaignId, slotId })}
          onFilterCountry={(c) => setFilterCountry(c)}
          onFilterPlatform={(p) => setFilterPlatform(p)}
          onFilterMonth={(m) => setFilterMonth(m as typeof filterMonth)}
        />
        </>)}
      </div>

      {/* Modal */}
      {selectedSlot && selectedCampaign && (
        <SlotModal
          campaign={selectedCampaign}
          slotId={selectedSlot.slotId}
          onClose={() => setSelectedSlot(null)}
          onSubmit={handleApplication}
        />
      )}
    </div>
  );
}


function FilterButton({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: string;
}) {
  const activeColor = accent || "#111";
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        backgroundColor: active ? activeColor : "transparent",
        border: `1px solid ${active ? activeColor : "#e5e7eb"}`,
        borderRadius: "6px",
        color: active ? "#fff" : "#6b7280",
        fontSize: "12px",
        fontWeight: active ? "600" : "400",
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = activeColor;
          e.currentTarget.style.color = activeColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = "#e5e7eb";
          e.currentTarget.style.color = "#6b7280";
        }
      }}
    >
      {label}
    </button>
  );
}

