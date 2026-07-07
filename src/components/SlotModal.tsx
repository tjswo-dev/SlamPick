"use client";

import { useState } from "react";
import { X, CheckCircle, AlertCircle, Users, Calendar, Tag } from "lucide-react";
import { Campaign, BrandApplication } from "@/lib/types";

interface SlotModalProps {
  campaign: Campaign;
  slotId: number;
  onClose: () => void;
  onSubmit: (application: BrandApplication) => Promise<{ ok: boolean; error?: string }>;
}

export default function SlotModal({ campaign, slotId, onClose, onSubmit }: SlotModalProps) {
  const [step, setStep] = useState<"guide" | "form" | "success">("guide");
  const [reserveAll, setReserveAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    brandName: "",
    productName: "",
    productUrl: "",
    productDescription: "",
    exposurePoint: "",
    referenceVideoUrl: "",
    precautions: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const availableSlots = campaign.slots.filter((s) => s.status === "available");
  const availableCount = availableSlots.length;
  const thisSlot = campaign.slots.find((s) => s.id === slotId);
  const isClosed = thisSlot?.status === "filled" || thisSlot?.status === "reserved";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    const targetSlotIds = reserveAll ? availableSlots.map((s) => s.id) : [slotId];
    const result = await onSubmit({
      campaignId: campaign.id,
      slotId: targetSlotIds[0],
      slotIds: reserveAll ? targetSlotIds : undefined,
      budget: campaign.perSlotCost.toLocaleString("ko-KR") + "원",
      ...form,
    });
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error ?? "신청 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }
    setStep("success");
  };

  const platformLabel = {
    youtube: "YouTube",
    instagram: "Instagram",
    tiktok: "TikTok",
    xiaohongshu: "Xiaohongshu",
  }[campaign.influencer.platform];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 20px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p style={{ fontSize: "11px", color: "#9ca3af", letterSpacing: "0.08em", marginBottom: "6px", fontWeight: "600" }}>
              SLOT #{slotId} · {platformLabel}
            </p>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#111", lineHeight: "1.3" }}>
              {campaign.contentTitle}
            </h2>
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
              {campaign.influencer.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              color: "#9ca3af",
              cursor: "pointer",
              padding: "6px",
              marginLeft: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.color = "#374151";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Slot remaining badge */}
        <div
          style={{
            margin: "16px 24px",
            padding: "10px 14px",
            backgroundColor: availableCount <= 1 ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${availableCount <= 1 ? "#fecaca" : "#bbf7d0"}`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {availableCount <= 1 ? (
            <AlertCircle size={15} color="#ef4444" />
          ) : (
            <Users size={15} color="#16a34a" />
          )}
          <span style={{ fontSize: "13px", color: availableCount <= 1 ? "#dc2626" : "#16a34a", fontWeight: "600" }}>
            {campaign.totalSlots}개 슬롯 중 {availableCount}개 남음
          </span>
          <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "auto" }}>
            슬롯당 {(campaign.perSlotCost / 10000).toLocaleString("ko-KR")}만원
          </span>
        </div>

        {step === "guide" && (
          <div style={{ padding: "0 24px 24px" }}>
            {/* Key info chips */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
              <InfoChip icon={<Calendar size={11} />} label="촬영일" value={campaign.shootingDate} />
              <InfoChip icon={<Calendar size={11} />} label="게시일" value={campaign.publishDate} />
              <InfoChip icon={<Tag size={11} />} label="유형" value={campaign.contentType} />
            </div>

            {/* Content Guide */}
            <Section title="콘텐츠 가이드">
              {(() => {
                let numIdx = 0;
                return campaign.contentGuide.map((g, i) => {
                  const isConcept = g.startsWith("컨셉:");
                  if (!isConcept) numIdx++;
                  return <GuideItem key={i} index={numIdx} text={g} />;
                });
              })()}
            </Section>

            {/* Restrictions */}
            <Section title="탑승 제한 사항">
              {campaign.restrictions.map((r, i) => (
                <RestrictItem key={i} text={r} />
              ))}
            </Section>

            {/* Slot visual */}
            <Section title="현재 슬롯 현황">
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {campaign.slots.map((slot) => (
                  <div
                    key={slot.id}
                    style={{
                      padding: "8px 12px",
                      border: `1.5px solid ${
                        slot.status === "filled"
                          ? "#e5e7eb"
                          : slot.status === "reserved"
                          ? "#fde68a"
                          : slot.id === slotId
                          ? "#4ade80"
                          : "#86efac"
                      }`,
                      borderRadius: "8px",
                      backgroundColor:
                        slot.status === "filled"
                          ? "#f9fafb"
                          : slot.status === "reserved"
                          ? "#fffbeb"
                          : slot.id === slotId
                          ? "#dcfce7"
                          : "#f0fdf4",
                      fontSize: "11px",
                      color:
                        slot.status === "filled"
                          ? "#d1d5db"
                          : slot.status === "reserved"
                          ? "#d97706"
                          : slot.id === slotId
                          ? "#16a34a"
                          : "#15803d",
                      fontWeight: slot.id === slotId ? "700" : "500",
                      minWidth: "76px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ marginBottom: "2px" }}>슬롯 #{slot.id}</div>
                    <div style={{ fontSize: "10px", opacity: 0.85 }}>
                      {slot.status === "filled"
                        ? slot.brandName || "마감"
                        : slot.status === "reserved"
                        ? slot.brandName || "협의 중"
                        : slot.id === slotId
                        ? "← 선택됨"
                        : "신청 가능"}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {isClosed ? (
              <button
                onClick={onClose}
                style={{ width: "100%", padding: "13px", backgroundColor: "transparent", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.15s", marginTop: "8px" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#374151"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
              >
                닫기
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "stretch" }}>
                <button
                  onClick={() => setStep("form")}
                  style={{ flex: 1, padding: "13px", backgroundColor: "#111", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", letterSpacing: "0.02em", cursor: "pointer", transition: "background-color 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#111")}
                >
                  이 슬롯 신청하기 →
                </button>
                {availableCount > 1 && (
                  <button
                    onClick={() => { setReserveAll(true); setStep("form"); }}
                    title={`남은 ${availableCount}개 슬롯 전체를 단독으로 선점합니다`}
                    style={{ padding: "10px 12px", backgroundColor: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#9ca3af", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap", lineHeight: "1.4", transition: "all 0.15s", textAlign: "center" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    모두<br />선점하기
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} style={{ padding: "0 24px 24px" }}>
            {reserveAll ? (
              <div style={{ marginBottom: "20px", padding: "10px 14px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
                <p style={{ fontSize: "13px", color: "#16a34a", fontWeight: "700", marginBottom: "2px" }}>
                  슬롯 {availableSlots.map((s) => `#${s.id}`).join(", ")} — 전체 선점 신청
                </p>
                <p style={{ fontSize: "11px", color: "#6b7280" }}>
                  {availableCount}개 슬롯 · 총 {((campaign.perSlotCost * availableCount) / 10000).toLocaleString("ko-KR")}만원
                </p>
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px", lineHeight: "1.6" }}>
                브랜드 정보를 입력해 주세요. 제출 후 영업일 1일 내 담당자가 연락 드립니다.
              </p>
            )}

            <FormGroup label="회사명 *">
              <FormInput
                placeholder="(주)브랜드코리아"
                value={form.companyName}
                onChange={(v) => setForm({ ...form, companyName: v })}
                required
              />
            </FormGroup>
            <FormGroup label="브랜드명 *">
              <FormInput
                placeholder="브랜드 이름"
                value={form.brandName}
                onChange={(v) => setForm({ ...form, brandName: v })}
                required
              />
            </FormGroup>
            <FormGroup label="제품명 *">
              <FormInput
                placeholder="노출 희망 제품명"
                value={form.productName}
                onChange={(v) => setForm({ ...form, productName: v })}
                required
              />
            </FormGroup>
            <FormGroup label="제품 링크">
              <FormInput
                type="url"
                placeholder="https://www.brand.com/product"
                value={form.productUrl}
                onChange={(v) => setForm({ ...form, productUrl: v })}
              />
            </FormGroup>
            <FormGroup label="제품 소개 *">
              <textarea
                placeholder="제품의 주요 특징을 작성해주세요"
                value={form.productDescription}
                onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
                required
                rows={3}
                style={textareaStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#9ca3af")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </FormGroup>
            <FormGroup label="노출 포인트 *">
              <textarea
                placeholder="콘텐츠 속 노출 키워드 및 강조하고 싶은 메시지를 입력해주세요 (예: #비타민C #피부개선 / '피부가 맑아진다' 느낌 강조)"
                value={form.exposurePoint}
                onChange={(e) => setForm({ ...form, exposurePoint: e.target.value })}
                required
                rows={3}
                style={textareaStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#9ca3af")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </FormGroup>
            <FormGroup label="참고 가이드 영상 URL">
              <FormInput
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.referenceVideoUrl}
                onChange={(v) => setForm({ ...form, referenceVideoUrl: v })}
              />
            </FormGroup>
            <FormGroup label="주의사항 및 금지사항">
              <textarea
                placeholder="콘텐츠 제작 시 반드시 피해야 할 표현, 경쟁 브랜드 언급 금지 등 주의사항을 작성해주세요"
                value={form.precautions}
                onChange={(e) => setForm({ ...form, precautions: e.target.value })}
                rows={3}
                style={textareaStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#9ca3af")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </FormGroup>
            <FormGroup label="담당자명 *">
              <FormInput
                placeholder="홍길동"
                value={form.contactName}
                onChange={(v) => setForm({ ...form, contactName: v })}
                required
              />
            </FormGroup>
            <FormGroup label="이메일 *">
              <FormInput
                type="email"
                placeholder="brand@company.com"
                value={form.contactEmail}
                onChange={(v) => setForm({ ...form, contactEmail: v })}
                required
              />
            </FormGroup>
            <FormGroup label="연락처 *">
              <FormInput
                placeholder="010-0000-0000"
                value={form.contactPhone}
                onChange={(v) => setForm({ ...form, contactPhone: v })}
                required
              />
            </FormGroup>

            {/* Cost summary */}
            <div
              style={{
                padding: "14px 16px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "13px", color: "#6b7280" }}>예상 비용</span>
              <span style={{ fontSize: "20px", fontWeight: "800", color: "#111" }}>
                {(campaign.perSlotCost / 10000).toLocaleString("ko-KR")}만원
              </span>
            </div>

            {submitError && (
              <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", marginBottom: "12px" }}>
                <p style={{ fontSize: "13px", color: "#dc2626" }}>{submitError}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setStep("guide")}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "13px",
                  backgroundColor: "transparent",
                  color: "#6b7280",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: submitting ? "default" : "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#374151"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
              >
                이전
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: "13px",
                  backgroundColor: submitting ? "#6b7280" : "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: submitting ? "default" : "pointer",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#374151"; }}
                onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#111"; }}
              >
                {submitting ? "신청 중..." : "탑승 신청 완료"}
              </button>
            </div>
          </form>
        )}

        {step === "success" && (
          <div
            style={{
              padding: "40px 24px 40px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#111", marginBottom: "8px" }}>
                신청이 완료되었습니다
              </h3>
              <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.7" }}>
                <strong style={{ color: "#111" }}>{form.brandName}</strong>의 신청이 접수되었습니다.
                <br />
                영업일 1일 내 담당자가{" "}
                <strong style={{ color: "#111" }}>{form.contactEmail}</strong>
                으로 연락 드리겠습니다.
              </p>
            </div>
            <div
              style={{
                padding: "14px 16px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
                width: "100%",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#9ca3af" }}>캠페인</span>
                <span style={{ color: "#374151", fontWeight: "500" }}>{campaign.contentTitle}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9ca3af" }}>슬롯</span>
                <span>
                  {reserveAll ? (
                    <>
                      <span style={{ color: "#16a34a", fontWeight: "700" }}>{availableSlots.map((s) => `#${s.id}`).join(", ")}</span>
                      <span style={{ color: "#9ca3af" }}> · 총 {((campaign.perSlotCost * availableCount) / 10000).toLocaleString("ko-KR")}만원</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: "#16a34a", fontWeight: "700" }}>#{slotId}</span>
                      <span style={{ color: "#9ca3af" }}> · {(campaign.perSlotCost / 10000).toLocaleString("ko-KR")}만원</span>
                    </>
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "13px",
                backgroundColor: "#111",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                marginTop: "4px",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#111")}
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  color: "#111",
  padding: "10px 12px",
  fontSize: "13px",
  resize: "vertical",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "5px 10px",
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
      }}
    >
      <span style={{ color: "#9ca3af" }}>{icon}</span>
      <span style={{ fontSize: "11px", color: "#9ca3af" }}>{label}</span>
      <span style={{ fontSize: "11px", color: "#374151", fontWeight: "500" }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <p style={{ fontSize: "11px", color: "#9ca3af", letterSpacing: "0.08em", fontWeight: "600", marginBottom: "10px" }}>
        {title.toUpperCase()}
      </p>
      {children}
    </div>
  );
}

function GuideItem({ index, text }: { index: number; text: string }) {
  if (text.startsWith("컨셉:")) {
    return (
      <div style={{ padding: "10px 12px", backgroundColor: "#f8f9fb", border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "10px", fontWeight: "700", color: "#9ca3af", letterSpacing: "0.08em", marginBottom: "6px", display: "block" }}>CONCEPT</span>
        <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.7" }}>{text.slice(4).trim()}</span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: "10px", padding: "9px 0", borderBottom: "1px solid #f3f4f6", alignItems: "flex-start" }}>
      <span style={{ fontSize: "10px", color: "#fff", backgroundColor: "#111", width: "20px", height: "20px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: "700" }}>
        {index}
      </span>
      <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6" }}>{text}</span>
    </div>
  );
}

function RestrictItem({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: "8px", padding: "6px 0", alignItems: "flex-start" }}>
      <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "1px", flexShrink: 0 }}>✕</span>
      <span style={{ fontSize: "13px", color: "#6b7280" }}>{text}</span>
    </div>
  );
}

function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          color: "#6b7280",
          fontWeight: "600",
          letterSpacing: "0.04em",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function FormInput({
  placeholder,
  value,
  onChange,
  required,
  type = "text",
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      style={{
        width: "100%",
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        color: "#111",
        padding: "10px 12px",
        fontSize: "13px",
        outline: "none",
        fontFamily: "inherit",
        transition: "border-color 0.15s",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#9ca3af")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
    />
  );
}
