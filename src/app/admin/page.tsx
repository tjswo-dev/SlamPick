"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, CheckCircle, XCircle, Clock, BarChart2, Users, Layers, Plus, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { ApplicationStatus } from "@/lib/types";
import CampaignFormModal, { type CampaignEditData } from "@/components/CampaignFormModal";

const ADMIN_EMAILS = ["admin@slam-global.com"];

interface AdminApp {
  id: string;
  slotDbId: string;
  slotNumber: number;
  campaignId: string;
  campaignTitle: string;
  perSlotCost: number;
  influencerName: string;
  influencerPlatform: string;
  influencerThumbnail: string;
  companyName: string;
  brandName: string;
  productName: string;
  contactEmail: string;
  status: ApplicationStatus;
  appliedAt: string;
  invoiceNumber?: string;
}

interface AdminCampaign {
  id: string;
  influencerId: string;
  contentTitle: string;
  contentType: string;
  recruitDeadline: string;
  shootingDate: string;
  publishDate: string;
  status: "open" | "closing";
  perSlotCost: number;
  totalSlots: number;
  country: "us" | "jp" | "cn";
  thumbnailUrl: string;
  contentGuide: string[];
  restrictions: string[];
  influencerName: string;
  influencerPlatform: string;
  influencerThumbnail: string;
  slots: { number: number; status: string; brandName?: string }[];
}

const STATUS_META: Record<ApplicationStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:            { label: "신청 중",      color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  approved:           { label: "승인됨",       color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  payment_pending:    { label: "입금 대기",    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  payment_confirming: { label: "입금 확인 중", color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
  active:             { label: "진행 중",      color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  completed:          { label: "완료",         color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
  rejected:           { label: "반려",         color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

type AppFilter = "all" | "pending" | "payment_confirming" | "active" | "completed" | "rejected";
const FILTER_TABS: { key: AppFilter; label: string }[] = [
  { key: "all",               label: "전체" },
  { key: "pending",           label: "신청 중" },
  { key: "payment_confirming",label: "입금 확인 중" },
  { key: "active",            label: "진행 중" },
  { key: "completed",         label: "완료" },
  { key: "rejected",          label: "반려" },
];

const PLATFORM_LABEL: Record<string, string> = {
  youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", xiaohongshu: "Xiaohongshu",
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"applications" | "campaigns">("applications");
  const [appFilter, setAppFilter] = useState<AppFilter>("all");
  const [apps, setApps] = useState<AdminApp[]>([]);
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [campaignModal, setCampaignModal] = useState<{ open: boolean; mode: "create" | "edit"; target?: CampaignEditData }>({ open: false, mode: "create" });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const loadData = async () => {
    setLoading(true);

    const { data: appRows } = await supabase
      .from("applications")
      .select(`
        id, campaign_id, slot_id,
        company_name, brand_name, product_name, contact_email,
        status, applied_at,
        slots(id, slot_number),
        campaigns(id, content_title, per_slot_cost, influencer:influencers(name, platform, thumbnail_url)),
        invoices(invoice_number)
      `)
      .order("applied_at", { ascending: false });

    if (appRows) {
      setApps(appRows.map((r) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = r as any;
        const slot = (Array.isArray(row.slots) ? row.slots[0] : row.slots) as { id: string; slot_number: number } | null;
        const camp = (Array.isArray(row.campaigns) ? row.campaigns[0] : row.campaigns) as { content_title: string; per_slot_cost: number; influencer: { name: string; platform: string; thumbnail_url: string } } | null;
        const inv = (Array.isArray(row.invoices) ? row.invoices[0] : row.invoices) as { invoice_number?: string } | null;
        return {
          id: row.id,
          slotDbId: slot?.id ?? "",
          slotNumber: slot?.slot_number ?? 0,
          campaignId: row.campaign_id,
          campaignTitle: camp?.content_title ?? "",
          perSlotCost: camp?.per_slot_cost ?? 0,
          influencerName: camp?.influencer?.name ?? "",
          influencerPlatform: camp?.influencer?.platform ?? "",
          influencerThumbnail: camp?.influencer?.thumbnail_url ?? "",
          companyName: row.company_name,
          brandName: row.brand_name,
          productName: row.product_name,
          contactEmail: row.contact_email,
          status: row.status as ApplicationStatus,
          appliedAt: row.applied_at?.slice(0, 10) ?? "",
          invoiceNumber: inv?.invoice_number,
        };
      }));
    }

    const { data: campRows } = await supabase
      .from("campaigns")
      .select(`
        id, influencer_id, content_title, content_type, recruit_deadline,
        shooting_date, publish_date, status, per_slot_cost, total_slots,
        country, thumbnail_url, content_guide, restrictions,
        influencer:influencers!campaigns_influencer_id_fkey(id, name, handle, platform, followers, thumbnail_url),
        slots(slot_number, status, brand_name)
      `)
      .order("shooting_date", { ascending: true });

    if (campRows) {
      setCampaigns(campRows.map((r) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = r as any;
        const influencer = (Array.isArray(row.influencer) ? row.influencer[0] : row.influencer) as { id: string; name: string; platform: string; thumbnail_url: string } | null;
        return {
          id: row.id,
          influencerId: row.influencer_id ?? influencer?.id ?? "",
          contentTitle: row.content_title,
          contentType: row.content_type ?? "",
          recruitDeadline: row.recruit_deadline ?? "",
          shootingDate: row.shooting_date,
          publishDate: row.publish_date,
          status: row.status as "open" | "closing",
          perSlotCost: row.per_slot_cost,
          totalSlots: row.total_slots,
          country: row.country as "us" | "jp" | "cn",
          thumbnailUrl: row.thumbnail_url ?? "",
          contentGuide: Array.isArray(row.content_guide) ? row.content_guide : [],
          restrictions: Array.isArray(row.restrictions) ? row.restrictions : [],
          influencerName: influencer?.name ?? "",
          influencerPlatform: influencer?.platform ?? "",
          influencerThumbnail: influencer?.thumbnail_url ?? "",
          slots: [...(row.slots ?? [])]
            .sort((a: { slot_number: number }, b: { slot_number: number }) => a.slot_number - b.slot_number)
            .map((s: { slot_number: number; status: string; brand_name?: string }) => ({
              number: s.slot_number,
              status: s.status,
              brandName: s.brand_name,
            })),
        };
      }));
    }


    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
        setIsAdmin(false);
        router.push("/dashboard");
        return;
      }
      setIsAdmin(true);
      await loadData();
    };
    init();
  }, []);

  const handleApprove = async (app: AdminApp) => {
    setActionLoading(app.id + "_approve");
    try {
      const now = new Date();
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 7);
      const invoiceNumber = `SP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(Math.random() * 9000) + 1000}`;

      await supabase.from("invoices").insert({
        application_id: app.id,
        invoice_number: invoiceNumber,
        issued_at: now.toISOString().split("T")[0],
        payment_due_date: dueDate.toISOString().split("T")[0],
        status: "issued",
      });

      await supabase.from("applications").update({ status: "approved" }).eq("id", app.id);
      setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, status: "approved", invoiceNumber } : a));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (app: AdminApp) => {
    setActionLoading(app.id + "_reject");
    try {
      await supabase.from("applications").update({ status: "rejected" }).eq("id", app.id);
      if (app.slotDbId) {
        await supabase.from("slots").update({ status: "available", brand_name: null }).eq("id", app.slotDbId);
      }
      setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, status: "rejected" } : a));
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmPayment = async (app: AdminApp) => {
    setActionLoading(app.id + "_confirm");
    try {
      await supabase.from("invoices").update({ status: "paid" }).eq("application_id", app.id);
      await supabase.from("applications").update({ status: "active" }).eq("id", app.id);
      if (app.slotDbId) {
        await supabase.from("slots").update({ status: "filled" }).eq("id", app.slotDbId);
      }
      setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, status: "active" } : a));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCampaign = async (campaign: AdminCampaign) => {
    const hasActive = campaign.slots.some((s) => s.status !== "available");
    if (hasActive) {
      if (!window.confirm(`"${campaign.contentTitle}"에 예약/확정된 슬롯이 있습니다. 정말 삭제하시겠습니까?\n(연관된 신청 및 인보이스도 모두 삭제됩니다)`)) return;
    } else {
      if (!window.confirm(`"${campaign.contentTitle}"을 삭제하시겠습니까?`)) return;
    }

    // 연관 데이터 순서대로 삭제
    const { data: slotRows } = await supabase.from("slots").select("id").eq("campaign_id", campaign.id);
    const slotIds = (slotRows ?? []).map((s: { id: string }) => s.id);

    if (slotIds.length > 0) {
      const { data: appRows } = await supabase.from("applications").select("id").in("slot_id", slotIds);
      const appIds = (appRows ?? []).map((a: { id: string }) => a.id);
      if (appIds.length > 0) {
        await supabase.from("invoices").delete().in("application_id", appIds);
        await supabase.from("applications").delete().in("id", appIds);
      }
      await supabase.from("slots").delete().eq("campaign_id", campaign.id);
    }

    await supabase.from("campaigns").delete().eq("id", campaign.id);
    setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
  };

  const handleToggleCampaignStatus = async (campaign: AdminCampaign) => {
    const newStatus = campaign.status === "open" ? "closing" : "open";
    await supabase.from("campaigns").update({ status: newStatus }).eq("id", campaign.id);
    setCampaigns((prev) => prev.map((c) => c.id === campaign.id ? { ...c, status: newStatus } : c));
  };

  const filteredApps = useMemo(() => {
    if (appFilter === "all") return apps;
    return apps.filter((a) => a.status === appFilter);
  }, [apps, appFilter]);

  const counts: Record<AppFilter, number> = {
    all: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    payment_confirming: apps.filter((a) => a.status === "payment_confirming").length,
    active: apps.filter((a) => a.status === "active").length,
    completed: apps.filter((a) => a.status === "completed").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  if (isAdmin === null) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fb", color: "#111" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, backgroundColor: "#111", borderBottom: "1px solid #222", zIndex: 100, padding: "0 28px", display: "flex", alignItems: "center", height: "60px", gap: "16px" }}>
        <h1
          style={{ fontSize: "20px", fontWeight: "900", color: "#fff", letterSpacing: "-0.04em", cursor: "pointer" }}
          onClick={() => router.push("/dashboard")}
        >
          SLAM PICK
        </h1>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", backgroundColor: "#222", padding: "3px 8px", borderRadius: "4px", letterSpacing: "0.08em" }}>
          ADMIN
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => router.push("/dashboard")}
          style={{ padding: "6px 16px", backgroundColor: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#9ca3af", fontSize: "13px", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#e5e7eb"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#9ca3af"; }}
        >
          대시보드
        </button>
        <button
          onClick={handleLogout}
          style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px" }}
        >
          <LogOut size={14} /><span>Log Out</span>
        </button>
      </nav>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 28px" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: "900", color: "#111", letterSpacing: "-0.04em", marginBottom: "6px" }}>
            ADMIN PANEL
          </h2>
          <p style={{ fontSize: "14px", color: "#9ca3af" }}>신청 승인 · 반려 · 결제 확인 · 캠페인 관리</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af", fontSize: "14px" }}>불러오는 중...</div>
        ) : (<>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
          <StatCard icon={<BarChart2 size={18} />} label="전체 신청" value={apps.length} color="#111" />
          <StatCard icon={<Clock size={18} color="#d97706" />} label="신청 대기" value={counts.pending} color="#d97706" alert={counts.pending > 0} />
          <StatCard icon={<Clock size={18} color="#6b7280" />} label="입금 확인 중" value={counts.payment_confirming} color="#6b7280" alert={counts.payment_confirming > 0} />
          <StatCard icon={<CheckCircle size={18} color="#16a34a" />} label="진행 중" value={counts.active} color="#16a34a" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", marginBottom: "20px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden", width: "fit-content" }}>
          {(["applications", "campaigns"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 24px",
                border: "none",
                backgroundColor: activeTab === tab ? "#111" : "transparent",
                color: activeTab === tab ? "#fff" : "#6b7280",
                fontSize: "13px",
                fontWeight: activeTab === tab ? "700" : "400",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              {tab === "applications" ? <><Users size={14} /> 신청 관리</> : <><Layers size={14} /> 캠페인 관리</>}
            </button>
          ))}
        </div>

        {/* ── 신청 관리 ── */}
        {activeTab === "applications" && (
          <div>
            {/* Filter tabs */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
              {FILTER_TABS.map(({ key, label }) => {
                const count = counts[key];
                const isActive = appFilter === key;
                const isAlert = (key === "pending" || key === "payment_confirming") && count > 0;
                return (
                  <button
                    key={key}
                    onClick={() => setAppFilter(key)}
                    style={{
                      padding: "5px 12px", borderRadius: "6px",
                      border: `1px solid ${isActive ? "#111" : "#e5e7eb"}`,
                      backgroundColor: isActive ? "#111" : "transparent",
                      color: isActive ? "#fff" : "#6b7280",
                      fontSize: "12px", fontWeight: isActive ? "700" : "400",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#374151"; } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; } }}
                  >
                    {label}
                    {count > 0 && (
                      <span style={{ backgroundColor: isActive ? "rgba(255,255,255,0.2)" : isAlert ? "#f59e0b" : "#f3f4f6", color: isActive ? "#fff" : isAlert ? "#fff" : "#9ca3af", borderRadius: "10px", padding: "1px 6px", fontSize: "11px", fontWeight: "700" }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
              <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9ca3af" }}>{filteredApps.length}건</span>
            </div>

            {/* Application rows */}
            {filteredApps.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#d1d5db", border: "1px dashed #e5e7eb", borderRadius: "12px", backgroundColor: "#fff" }}>
                <p style={{ fontSize: "14px" }}>해당 신청이 없습니다</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredApps.map((app) => {
                  const meta = STATUS_META[app.status];
                  const isApproving = actionLoading === app.id + "_approve";
                  const isRejecting = actionLoading === app.id + "_reject";
                  const isConfirming = actionLoading === app.id + "_confirm";

                  return (
                    <div
                      key={app.id}
                      style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}
                    >
                      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
                        {/* Thumbnail */}
                        <div style={{ width: "52px", height: "52px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, backgroundColor: "#f3f4f6", position: "relative" }}>
                          {app.influencerThumbnail && (
                            <Image src={app.influencerThumbnail} alt={app.influencerName} fill style={{ objectFit: "cover" }} />
                          )}
                        </div>

                        {/* Campaign + Influencer */}
                        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: "700", color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {app.campaignTitle}
                          </p>
                          <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                            {app.influencerName} · {PLATFORM_LABEL[app.influencerPlatform] ?? app.influencerPlatform} · 슬롯 #{app.slotNumber}
                          </p>
                        </div>

                        {/* Brand */}
                        <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>{app.brandName}</p>
                          <p style={{ fontSize: "11px", color: "#9ca3af" }}>{app.companyName}</p>
                          <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "1px" }}>{app.productName}</p>
                        </div>

                        {/* Cost + Date */}
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <p style={{ fontSize: "14px", fontWeight: "800", color: "#111" }}>
                            {(app.perSlotCost / 10000).toLocaleString("ko-KR")}만원
                          </p>
                          <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{app.appliedAt}</p>
                        </div>

                        {/* Status */}
                        <div style={{ flexShrink: 0 }}>
                          <span style={{ fontSize: "11px", fontWeight: "600", padding: "3px 10px", backgroundColor: meta.bg, border: `1px solid ${meta.border}`, borderRadius: "20px", color: meta.color }}>
                            {meta.label}
                          </span>
                          {app.invoiceNumber && (
                            <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "3px", textAlign: "center" }}>{app.invoiceNumber}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ flexShrink: 0, display: "flex", gap: "6px" }}>
                          {app.status === "pending" && (
                            <>
                              <ActionButton
                                label={isApproving ? "처리 중..." : "승인"}
                                onClick={() => handleApprove(app)}
                                disabled={!!actionLoading}
                                variant="approve"
                              />
                              <ActionButton
                                label={isRejecting ? "처리 중..." : "반려"}
                                onClick={() => handleReject(app)}
                                disabled={!!actionLoading}
                                variant="reject"
                              />
                            </>
                          )}
                          {app.status === "payment_confirming" && (
                            <ActionButton
                              label={isConfirming ? "처리 중..." : "입금 확인"}
                              onClick={() => handleConfirmPayment(app)}
                              disabled={!!actionLoading}
                              variant="confirm"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── 캠페인 관리 ── */}
        {activeTab === "campaigns" && (
          <div>
            {/* 새 캠페인 버튼 */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
              <button
                onClick={() => setCampaignModal({ open: true, mode: "create" })}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", backgroundColor: "#111", border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
              >
                <Plus size={14} /> 새 캠페인 등록
              </button>
            </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {campaigns.map((camp) => {
              const availableCount = camp.slots.filter((s) => s.status === "available").length;
              const reservedCount = camp.slots.filter((s) => s.status === "reserved").length;
              const filledCount = camp.slots.filter((s) => s.status === "filled").length;

              return (
                <div
                  key={camp.id}
                  style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px" }}
                >
                  {/* Thumbnail */}
                  <div style={{ width: "56px", height: "56px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, backgroundColor: "#f3f4f6", position: "relative" }}>
                    {camp.influencerThumbnail && (
                      <Image src={camp.influencerThumbnail} alt={camp.influencerName} fill style={{ objectFit: "cover" }} />
                    )}
                  </div>

                  {/* Campaign info */}
                  <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {camp.contentTitle}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                      {camp.influencerName} · {PLATFORM_LABEL[camp.influencerPlatform] ?? camp.influencerPlatform}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "1px" }}>
                      촬영 {camp.shootingDate} · 게시 {camp.publishDate}
                    </p>
                  </div>

                  {/* Slot status */}
                  <div style={{ flex: "1 1 200px" }}>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                      {camp.slots.map((slot) => (
                        <div
                          key={slot.number}
                          title={slot.brandName ?? (slot.status === "available" ? "빈 슬롯" : slot.status)}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            backgroundColor:
                              slot.status === "available" ? "#f0fdf4" :
                              slot.status === "reserved" ? "#fffbeb" : "#f3f4f6",
                            border: `1.5px solid ${
                              slot.status === "available" ? "#86efac" :
                              slot.status === "reserved" ? "#fde68a" : "#d1d5db"
                            }`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: "700",
                            color: slot.status === "available" ? "#16a34a" : slot.status === "reserved" ? "#d97706" : "#9ca3af",
                          }}
                        >
                          {slot.number}
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: "11px", color: "#9ca3af" }}>
                      <span style={{ color: "#16a34a", fontWeight: "600" }}>{availableCount} 가능</span>
                      {reservedCount > 0 && <span style={{ color: "#d97706", fontWeight: "600" }}> · {reservedCount} 예약</span>}
                      {filledCount > 0 && <span style={{ color: "#9ca3af" }}> · {filledCount} 확정</span>}
                    </p>
                  </div>

                  {/* Per slot cost */}
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: "#111" }}>{(camp.perSlotCost / 10000).toLocaleString("ko-KR")}만원</p>
                    <p style={{ fontSize: "11px", color: "#9ca3af" }}>슬롯당</p>
                  </div>

                  {/* Status toggle + Edit */}
                  <div style={{ flexShrink: 0, display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      onClick={() => handleToggleCampaignStatus(camp)}
                      style={{
                        padding: "6px 14px",
                        border: "1px solid",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        borderColor: camp.status === "open" ? "#bbf7d0" : "#fecaca",
                        backgroundColor: camp.status === "open" ? "#f0fdf4" : "#fef2f2",
                        color: camp.status === "open" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {camp.status === "open" ? "모집 중" : "마감 임박"}
                    </button>
                    <button
                      onClick={() => setCampaignModal({
                        open: true,
                        mode: "edit",
                        target: {
                          id: camp.id,
                          influencerId: camp.influencerId,
                          influencerName: camp.influencerName,
                          contentTitle: camp.contentTitle,
                          contentType: camp.contentType,
                          recruitDeadline: camp.recruitDeadline,
                          shootingDate: camp.shootingDate,
                          publishDate: camp.publishDate,
                          totalSlots: camp.totalSlots,
                          perSlotCost: camp.perSlotCost,
                          country: camp.country,
                          thumbnailUrl: camp.thumbnailUrl,
                          status: camp.status,
                          contentGuide: camp.contentGuide.length > 0 ? camp.contentGuide : [""],
                          restrictions: camp.restrictions.length > 0 ? camp.restrictions : [""],
                        },
                      })}
                      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#6b7280", fontSize: "12px", cursor: "pointer" }}
                    >
                      <Pencil size={11} /> 수정
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(camp)}
                      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", backgroundColor: "#fff", border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626", fontSize: "12px", cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
                    >
                      <Trash2 size={11} /> 삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}

        </>)}
      </div>

      {/* Campaign Form Modal */}
      {campaignModal.open && (
        <CampaignFormModal
          mode={campaignModal.mode}
          existing={campaignModal.target}
          onClose={() => setCampaignModal({ open: false, mode: "create" })}
          onSaved={loadData}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, alert }: { icon: React.ReactNode; label: string; value: number; color: string; alert?: boolean }) {
  return (
    <div style={{
      backgroundColor: "#fff",
      border: `1px solid ${alert ? "#fde68a" : "#e5e7eb"}`,
      borderRadius: "12px",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: alert ? "0 0 0 3px rgba(251,191,36,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ color }}>{icon}</div>
      <div>
        <p style={{ fontSize: "22px", fontWeight: "900", color, letterSpacing: "-0.04em" }}>{value}</p>
        <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "1px" }}>{label}</p>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, disabled, variant }: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  variant: "approve" | "reject" | "confirm";
}) {
  const styles = {
    approve: { bg: "#111",     border: "#111",     color: "#fff",     hoverBg: "#374151" },
    reject:  { bg: "#fff",     border: "#fecaca",  color: "#dc2626",  hoverBg: "#fef2f2" },
    confirm: { bg: "#2563eb",  border: "#2563eb",  color: "#fff",     hoverBg: "#1d4ed8" },
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 14px",
        backgroundColor: disabled ? "#f3f4f6" : styles.bg,
        border: `1px solid ${disabled ? "#e5e7eb" : styles.border}`,
        borderRadius: "7px",
        color: disabled ? "#9ca3af" : styles.color,
        fontSize: "12px",
        fontWeight: "600",
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = styles.hoverBg; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = styles.bg; }}
    >
      {label}
    </button>
  );
}
