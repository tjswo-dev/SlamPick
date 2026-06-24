"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Edit2, Check, X, Building2, User, Mail, Phone, FileText, Tag, Calendar, FileDown, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import { Campaign, ApplicationStatus, MyApplication } from "@/lib/types";
import InvoiceModal from "@/components/InvoiceModal";

type AppFilter = "all" | ApplicationStatus | "payment_progress";

const STATUS_META: Record<ApplicationStatus, { label: string; bg: string; border: string; color: string }> = {
  pending:             { label: "신청 중",      bg: "#fffbeb", border: "#fde68a",  color: "#d97706" },
  approved:            { label: "결제 대기",    bg: "#eff6ff", border: "#bfdbfe",  color: "#2563eb" },
  payment_pending:     { label: "결제 대기",    bg: "#eff6ff", border: "#bfdbfe",  color: "#2563eb" },
  payment_confirming:  { label: "입금 확인 중", bg: "#f3f4f6", border: "#e5e7eb",  color: "#6b7280" },
  active:              { label: "진행 중",      bg: "#f0fdf4", border: "#bbf7d0",  color: "#16a34a" },
  completed:           { label: "완료",         bg: "#f3f4f6", border: "#e5e7eb",  color: "#6b7280" },
  rejected:            { label: "반려",         bg: "#fef2f2", border: "#fecaca",  color: "#dc2626" },
};

const PLATFORM_LABEL: Record<string, string> = {
  youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", xiaohongshu: "Xiaohongshu",
};

const FILTER_TABS: { key: AppFilter; label: string }[] = [
  { key: "all",              label: "전체" },
  { key: "pending",          label: "신청 중" },
  { key: "payment_progress", label: "결제 대기" },
  { key: "active",           label: "진행 중" },
  { key: "completed",        label: "완료" },
];

export default function MyPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const [filter, setFilter] = useState<AppFilter>("all");
  const [isEditing, setIsEditing] = useState(false);
  const [apps, setApps] = useState<MyApplication[]>([]);
  const [campaignMap, setCampaignMap] = useState<Record<string, Campaign>>({});
  const [dbLoading, setDbLoading] = useState(true);
  const [invoiceTarget, setInvoiceTarget] = useState<MyApplication | null>(null);
  const [paymentDates, setPaymentDates] = useState<Record<string, string>>({});

  const [profile, setProfile] = useState({
    companyName: "", brandName: "", contactName: "",
    email: "", phone: "", businessNumber: "",
  });
  const [draft, setDraft] = useState({ ...profile });

  // 유저 프로필 + 신청 내역 + 캠페인 정보 로드
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 프로필
      const { data: userRow } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userRow) {
        const p = {
          companyName: userRow.company_name || "",
          brandName: userRow.brand_name || "",
          contactName: userRow.contact_name || "",
          email: userRow.email || "",
          phone: userRow.phone || "",
          businessNumber: userRow.business_number || "",
        };
        setProfile(p);
        setDraft(p);
      }

      // 신청 내역
      const { data: appRows } = await supabase
        .from("applications")
        .select("*, invoices(*), slots(slot_number)")
        .eq("user_id", user.id)
        .order("applied_at", { ascending: false });

      if (appRows) {
        const mapped: MyApplication[] = appRows.map((r) => ({
          id: r.id,
          campaignId: r.campaign_id,
          slotId: r.slots?.slot_number ?? 0,
          status: r.status as ApplicationStatus,
          appliedAt: r.applied_at?.slice(0, 10) ?? "",
          companyName: r.company_name,
          brandName: r.brand_name,
          productName: r.product_name,
          invoiceNumber: r.invoices?.invoice_number,
          invoiceIssuedAt: r.invoices?.issued_at?.slice(0, 10),
          paymentDueDate: r.invoices?.payment_due_date,
          expectedPaymentDate: r.invoices?.expected_payment_date,
        }));
        setApps(mapped);

        // 연관 캠페인 로드
        const ids = [...new Set(appRows.map((r) => r.campaign_id))];
        if (ids.length > 0) {
          const { data: campRows } = await supabase
            .from("campaigns")
            .select("*, influencer:influencers(*), slots(*)")
            .in("id", ids);

          if (campRows) {
            const map: Record<string, Campaign> = {};
            campRows.forEach((row) => {
              map[row.id] = {
                id: row.id,
                influencer: {
                  name: row.influencer.name,
                  handle: row.influencer.handle,
                  platform: row.influencer.platform,
                  followers: row.influencer.followers,
                  category: row.influencer.category,
                  thumbnailUrl: row.thumbnail_url || row.influencer.thumbnail_url,
                  profileUrl: row.influencer.profile_url,
                },
                contentTitle: row.content_title,
                contentType: row.content_type,
                recruitDeadline: row.recruit_deadline,
                shootingDate: row.shooting_date,
                publishDate: row.publish_date,
                totalSlots: row.total_slots,
                slots: row.slots
                  .sort((a: { slot_number: number }, b: { slot_number: number }) => a.slot_number - b.slot_number)
                  .map((s: { slot_number: number; status: string; brand_name?: string }) => ({
                    id: s.slot_number,
                    status: s.status as "available" | "reserved" | "filled",
                    brandName: s.brand_name ?? undefined,
                  })),
                totalCost: row.total_cost,
                perSlotCost: row.per_slot_cost,
                contentGuide: row.content_guide,
                restrictions: row.restrictions,
                status: row.status,
                country: row.country,
              };
            });
            setCampaignMap(map);
          }
        }
      }

      setDbLoading(false);
    };
    load();
  }, []);

  const STATUS_ORDER: Record<string, number> = {
    approved: 0, payment_pending: 0,
    active: 1,
    pending: 2,
    payment_confirming: 3,
    completed: 4,
  };

  const filtered = useMemo(() => {
    let list: typeof apps;
    if (filter === "all") list = apps;
    else if (filter === "payment_progress") list = apps.filter((a) => a.status === "approved" || a.status === "payment_pending");
    else list = apps.filter((a) => a.status === filter);
    return [...list].sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99));
  }, [filter, apps]);

  const paymentProgressCount = apps.filter((a) => a.status === "approved" || a.status === "payment_pending").length;

  const counts: Record<AppFilter, number> = {
    all:               apps.length,
    pending:           apps.filter((a) => a.status === "pending").length,
    payment_progress:  paymentProgressCount,
    approved:          apps.filter((a) => a.status === "approved").length,
    payment_pending:   apps.filter((a) => a.status === "payment_pending").length,
    payment_confirming:apps.filter((a) => a.status === "payment_confirming").length,
    active:            apps.filter((a) => a.status === "active").length,
    completed:         apps.filter((a) => a.status === "completed").length,
    rejected:          apps.filter((a) => a.status === "rejected").length,
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("users").update({
        company_name: draft.companyName,
        brand_name: draft.brandName,
        contact_name: draft.contactName,
        phone: draft.phone,
        business_number: draft.businessNumber,
      }).eq("id", user.id);
    }
    setProfile({ ...draft });
    setIsEditing(false);
  };
  const handleCancel = () => { setDraft({ ...profile }); setIsEditing(false); };

  const updateApp = (id: string, patch: Partial<MyApplication>) => {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
  };

  const handlePaymentDone = async (app: MyApplication) => {
    const date = paymentDates[app.id] || app.expectedPaymentDate;
    if (!date) return;

    // invoices 테이블의 expected_payment_date 업데이트
    await supabase
      .from("invoices")
      .update({ expected_payment_date: date, status: "payment_confirming" })
      .eq("application_id", app.id);

    // applications 상태 업데이트
    await supabase
      .from("applications")
      .update({ status: "payment_confirming" })
      .eq("id", app.id);

    updateApp(app.id, { status: "payment_confirming", expectedPaymentDate: date });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fb", color: "#111" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", zIndex: 100, padding: "0 28px", display: "flex", alignItems: "center", height: "60px", gap: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#111", letterSpacing: "-0.04em", cursor: "pointer" }} onClick={() => router.push("/dashboard")}>
          SLAM PICK
        </h1>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => router.push("/dashboard")}
          style={{ padding: "7px 24px", backgroundColor: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#6b7280", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.15s", marginRight: "16px" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#374151"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
        >
          My Dashboard
        </button>
        <button
          onClick={handleLogout}
          style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px" }}
        >
          <LogOut size={14} /><span>Log Out</span>
        </button>
      </nav>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 28px" }}>
        {dbLoading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af", fontSize: "14px" }}>
            불러오는 중...
          </div>
        )}
        {!dbLoading && (<>
        {/* Title */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "900", color: "#111", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "10px" }}>
            MY DASHBOARD
          </h2>
          <p style={{ fontSize: "14px", color: "#9ca3af" }}>신청 현황 및 브랜드 정보를 관리하세요</p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* ── Left: Profile ── */}
          <div style={{ width: "288px", flexShrink: 0 }}>
            <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#111" }}>브랜드 정보</span>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", color: "#6b7280", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#374151"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}>
                    <Edit2 size={11} /> 수정
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#111", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", color: "#fff", cursor: "pointer", fontWeight: "600" }}>
                      <Check size={11} /> 저장
                    </button>
                    <button onClick={handleCancel} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "4px 8px", fontSize: "12px", color: "#9ca3af", cursor: "pointer" }}>
                      <X size={11} />
                    </button>
                  </div>
                )}
              </div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <ProfileField icon={<Building2 size={13} />} label="회사명"    value={isEditing ? draft.companyName    : profile.companyName}    editing={isEditing} onChange={(v) => setDraft({ ...draft, companyName: v })} />
                <ProfileField icon={<Tag size={13} />}       label="브랜드명"  value={isEditing ? draft.brandName      : profile.brandName}      editing={isEditing} onChange={(v) => setDraft({ ...draft, brandName: v })} />
                <ProfileField icon={<User size={13} />}      label="담당자명"  value={isEditing ? draft.contactName    : profile.contactName}    editing={isEditing} onChange={(v) => setDraft({ ...draft, contactName: v })} />
                <ProfileField icon={<Mail size={13} />}      label="이메일"    value={isEditing ? draft.email          : profile.email}          editing={isEditing} onChange={(v) => setDraft({ ...draft, email: v })} />
                <ProfileField icon={<Phone size={13} />}     label="전화번호"  value={isEditing ? draft.phone          : profile.phone}          editing={isEditing} onChange={(v) => setDraft({ ...draft, phone: v })} />
                <ProfileField icon={<FileText size={13} />}  label="사업자번호" value={isEditing ? draft.businessNumber : profile.businessNumber} editing={isEditing} onChange={(v) => setDraft({ ...draft, businessNumber: v })} />
              </div>
            </div>
          </div>

          {/* ── Right: Applications ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Filter tabs */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              {FILTER_TABS.map(({ key, label }) => {
                const count = counts[key];
                const isActive = filter === key;
                const needsAction = key === "payment_progress" && paymentProgressCount > 0;
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
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
                      <span style={{ backgroundColor: isActive ? "rgba(255,255,255,0.2)" : needsAction ? "#2563eb" : "#f3f4f6", color: isActive ? "#fff" : needsAction ? "#fff" : "#9ca3af", borderRadius: "10px", padding: "1px 6px", fontSize: "11px", fontWeight: "700" }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
              <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9ca3af" }}>{filtered.length}건</span>
            </div>

            {/* Application cards */}
            {filtered.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#d1d5db", border: "1px dashed #e5e7eb", borderRadius: "12px", backgroundColor: "#fff" }}>
                <p style={{ fontSize: "14px" }}>신청 내역이 없습니다</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filtered.map((app) => {
                  const campaign = campaignMap[app.campaignId];
                  if (!campaign) return null;
                  const meta = STATUS_META[app.status];
                  const currentDate = paymentDates[app.id] || app.expectedPaymentDate || "";
                  const canSubmitPayment = !!currentDate;
                  return (
                    <div
                      key={app.id}
                      style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                    >
                      {/* Main row */}
                      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, backgroundColor: "#f3f4f6", position: "relative" }}>
                          <Image src={campaign.influencer.thumbnailUrl} alt={campaign.influencer.name} fill style={{ objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", backgroundColor: meta.bg, border: `1px solid ${meta.border}`, borderRadius: "20px", color: meta.color }}>
                              {meta.label}
                            </span>
                            <span style={{ fontSize: "11px", color: "#9ca3af" }}>슬롯 #{app.slotId}</span>
                          </div>
                          <p style={{ fontSize: "14px", fontWeight: "700", color: "#111", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {campaign.contentTitle}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "12px", color: "#6b7280" }}>{campaign.influencer.name} · {PLATFORM_LABEL[campaign.influencer.platform]}</span>
                            <span style={{ width: "1px", height: "10px", backgroundColor: "#e5e7eb" }} />
                            <span style={{ fontSize: "12px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "3px" }}>
                              <Calendar size={11} /> 신청일 {app.appliedAt}
                            </span>
                          </div>
                          <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "3px" }}>제품: {app.productName}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                          <span style={{ fontSize: "16px", fontWeight: "800", color: "#111" }}>
                            {(campaign.perSlotCost / 10000).toLocaleString("ko-KR")}만원
                          </span>
                          <span style={{ fontSize: "11px", color: "#9ca3af" }}>슬롯 비용</span>
                        </div>
                      </div>

                      {/* ── 결제 대기 (approved + payment_pending) ── */}
                      {(app.status === "approved" || app.status === "payment_pending") && (
                        <div style={{ borderTop: "1px solid #dbeafe", backgroundColor: "#f0f7ff", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                          {/* Header */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <AlertCircle size={14} color="#2563eb" />
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#2563eb" }}>
                              승인되었습니다 — 인보이스를 확인하고 입금을 완료해 주세요.
                            </span>
                          </div>

                          {/* Invoice button — prominent */}
                          <button
                            onClick={() => setInvoiceTarget(app)}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              padding: "13px 20px",
                              backgroundColor: "#fff",
                              border: "1.5px solid #93c5fd",
                              borderRadius: "10px",
                              color: "#1d4ed8",
                              fontSize: "14px",
                              fontWeight: "700",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              letterSpacing: "-0.01em",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#eff6ff"; e.currentTarget.style.borderColor = "#3b82f6"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#93c5fd"; }}
                          >
                            <FileDown size={16} />
                            인보이스 확인하기
                          </button>

                          {/* Payment date + submit */}
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", flexShrink: 0 }}>입금날짜:</span>
                            <input
                              type="date"
                              value={paymentDates[app.id] ?? (app.expectedPaymentDate || "")}
                              onChange={(e) => setPaymentDates({ ...paymentDates, [app.id]: e.target.value })}
                              min={new Date().toISOString().split("T")[0]}
                              style={{ flex: 1, minWidth: "140px", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", color: "#374151", outline: "none", fontFamily: "inherit", backgroundColor: "#fff" }}
                            />
                            <button
                              onClick={() => handlePaymentDone(app)}
                              disabled={!canSubmitPayment}
                              style={{
                                padding: "8px 20px",
                                backgroundColor: canSubmitPayment ? "#111" : "#e5e7eb",
                                border: "none",
                                borderRadius: "8px",
                                color: canSubmitPayment ? "#fff" : "#9ca3af",
                                fontSize: "13px",
                                fontWeight: "700",
                                cursor: canSubmitPayment ? "pointer" : "default",
                                transition: "background-color 0.15s",
                                flexShrink: 0,
                              }}
                              onMouseEnter={(e) => { if (canSubmitPayment) e.currentTarget.style.backgroundColor = "#374151"; }}
                              onMouseLeave={(e) => { if (canSubmitPayment) e.currentTarget.style.backgroundColor = "#111"; }}
                            >
                              입금 완료
                            </button>
                          </div>
                          {app.paymentDueDate && (
                            <p style={{ fontSize: "11px", color: "#64748b" }}>납부 기한: <strong style={{ color: "#dc2626" }}>{app.paymentDueDate}</strong></p>
                          )}
                        </div>
                      )}

                      {app.status === "payment_confirming" && (
                        <div style={{ borderTop: "1px solid #f3f4f6", backgroundColor: "#fafafa", padding: "12px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <Clock size={13} color="#9ca3af" />
                          <span style={{ fontSize: "13px", color: "#6b7280" }}>
                            입금 확인 중입니다. 확인 완료 후 진행 중으로 변경됩니다.
                          </span>
                          {app.expectedPaymentDate && (
                            <span style={{ marginLeft: "auto", fontSize: "11px", color: "#9ca3af" }}>입금일: {app.expectedPaymentDate}</span>
                          )}
                        </div>
                      )}

                      {app.status === "active" && (
                        <div style={{ borderTop: "1px solid #f0fdf4", backgroundColor: "#f8fffe", padding: "12px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <CheckCircle size={13} color="#16a34a" />
                          <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600" }}>캠페인 진행 중</span>
                          <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "8px" }}>
                            촬영일 {campaign.shootingDate} · 게시일 {campaign.publishDate}
                          </span>
                        </div>
                      )}

                      {app.status === "completed" && (
                        <div style={{ borderTop: "1px solid #f3f4f6", backgroundColor: "#fafafa", padding: "12px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <CheckCircle size={13} color="#9ca3af" />
                          <span style={{ fontSize: "13px", color: "#9ca3af" }}>캠페인이 완료되었습니다.</span>
                          <button
                            onClick={() => setInvoiceTarget(app)}
                            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "#9ca3af", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}
                          >
                            <FileDown size={11} /> 인보이스
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </>)}
      </div>

      {/* Invoice Modal */}
      {invoiceTarget && (() => {
        const campaign = campaignMap[invoiceTarget.campaignId];
        if (!campaign) return null;
        return <InvoiceModal application={invoiceTarget} campaign={campaign} onClose={() => setInvoiceTarget(null)} />;
      })()}
    </div>
  );
}

function ProfileField({ icon, label, value, editing, onChange }: { icon: React.ReactNode; label: string; value: string; editing: boolean; onChange: (v: string) => void }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
        <span style={{ color: "#9ca3af" }}>{icon}</span>
        <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600" }}>{label}</span>
      </div>
      {editing ? (
        <input value={value} onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", color: "#111", padding: "7px 10px", fontSize: "13px", outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#9ca3af")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
        />
      ) : (
        <p style={{ fontSize: "13px", color: "#374151", fontWeight: "500", paddingLeft: "2px" }}>{value}</p>
      )}
    </div>
  );
}
