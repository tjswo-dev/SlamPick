"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export interface InfluencerOption {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: string;
  thumbnailUrl: string;
}

export interface CampaignEditData {
  id: string;
  influencerId: string;
  contentTitle: string;
  contentType: string;
  recruitDeadline: string;
  shootingDate: string;
  publishDate: string;
  totalSlots: number;
  perSlotCost: number;
  country: "us" | "jp" | "cn";
  thumbnailUrl: string;
  status: "open" | "closing";
  contentGuide: string[];
  restrictions: string[];
}

interface Props {
  mode: "create" | "edit";
  existing?: CampaignEditData;
  influencers: InfluencerOption[];
  onClose: () => void;
  onSaved: () => void;
}

const PLATFORM_LABEL: Record<string, string> = {
  youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", xiaohongshu: "Xiaohongshu",
};

const empty: Omit<CampaignEditData, "id"> = {
  influencerId: "",
  contentTitle: "",
  contentType: "",
  recruitDeadline: "",
  shootingDate: "",
  publishDate: "",
  totalSlots: 5,
  perSlotCost: 0,
  country: "us",
  thumbnailUrl: "",
  status: "open",
  contentGuide: [""],
  restrictions: [""],
};

export default function CampaignFormModal({ mode, existing, influencers, onClose, onSaved }: Props) {
  const supabase = createClient();
  const [form, setForm] = useState<Omit<CampaignEditData, "id">>(
    existing ? { ...existing } : { ...empty }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setGuide = (i: number, val: string) =>
    setForm((prev) => { const arr = [...prev.contentGuide]; arr[i] = val; return { ...prev, contentGuide: arr }; });
  const addGuide = () => setForm((prev) => ({ ...prev, contentGuide: [...prev.contentGuide, ""] }));
  const removeGuide = (i: number) =>
    setForm((prev) => ({ ...prev, contentGuide: prev.contentGuide.filter((_, idx) => idx !== i) }));

  const setRestriction = (i: number, val: string) =>
    setForm((prev) => { const arr = [...prev.restrictions]; arr[i] = val; return { ...prev, restrictions: arr }; });
  const addRestriction = () => setForm((prev) => ({ ...prev, restrictions: [...prev.restrictions, ""] }));
  const removeRestriction = (i: number) =>
    setForm((prev) => ({ ...prev, restrictions: prev.restrictions.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.influencerId || !form.contentTitle || !form.contentType || !form.recruitDeadline || !form.shootingDate || !form.publishDate || !form.perSlotCost) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }
    setSaving(true);
    setError("");

    const guideArr = form.contentGuide.filter((g) => g.trim() !== "");
    const restrictArr = form.restrictions.filter((r) => r.trim() !== "");

    const payload = {
      influencer_id: form.influencerId,
      content_title: form.contentTitle,
      content_type: form.contentType,
      recruit_deadline: form.recruitDeadline,
      shooting_date: form.shootingDate,
      publish_date: form.publishDate,
      total_slots: form.totalSlots,
      per_slot_cost: form.perSlotCost,
      total_cost: form.perSlotCost * form.totalSlots,
      country: form.country,
      thumbnail_url: form.thumbnailUrl || null,
      status: form.status,
      content_guide: guideArr,
      restrictions: restrictArr,
    };

    if (mode === "create") {
      const { data: camp, error: campErr } = await supabase
        .from("campaigns")
        .insert(payload)
        .select("id")
        .single();

      if (campErr || !camp) {
        setError("캠페인 저장 중 오류가 발생했습니다.");
        setSaving(false);
        return;
      }

      const slots = Array.from({ length: form.totalSlots }, (_, i) => ({
        campaign_id: camp.id,
        slot_number: i + 1,
        status: "available",
      }));
      await supabase.from("slots").insert(slots);
    } else {
      const { error: updErr } = await supabase
        .from("campaigns")
        .update(payload)
        .eq("id", existing!.id);

      if (updErr) {
        setError("수정 중 오류가 발생했습니다.");
        setSaving(false);
        return;
      }
    }

    onSaved();
    onClose();
  };

  const totalCost = form.perSlotCost * form.totalSlots;

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", width: "100%", maxWidth: "680px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#111", letterSpacing: "-0.03em" }}>
            {mode === "create" ? "새 캠페인 등록" : "캠페인 수정"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* 인플루언서 */}
            <Section title="인플루언서">
              <select
                value={form.influencerId}
                onChange={(e) => set("influencerId", e.target.value)}
                style={selectStyle}
              >
                <option value="">인플루언서 선택</option>
                {influencers.map((inf) => (
                  <option key={inf.id} value={inf.id}>
                    {inf.name} · {PLATFORM_LABEL[inf.platform] ?? inf.platform} ({inf.followers})
                  </option>
                ))}
              </select>
            </Section>

            {/* 캠페인 기본 정보 */}
            <Section title="기본 정보">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Field label="캠페인명 *">
                  <input style={inputStyle} value={form.contentTitle} onChange={(e) => set("contentTitle", e.target.value)} placeholder="ex. 약국 브이로그 – 건강 루틴" />
                </Field>
                <Field label="컨텐츠 타입 *">
                  <input style={inputStyle} value={form.contentType} onChange={(e) => set("contentType", e.target.value)} placeholder="ex. 약국 방문 촬영 브이로그" />
                </Field>
                <Field label="국가 *">
                  <select style={selectStyle} value={form.country} onChange={(e) => set("country", e.target.value as "us" | "jp" | "cn")}>
                    <option value="us">US</option>
                    <option value="jp">JAPAN</option>
                    <option value="cn">CHINA</option>
                  </select>
                </Field>
                <Field label="상태">
                  <select style={selectStyle} value={form.status} onChange={(e) => set("status", e.target.value as "open" | "closing")}>
                    <option value="open">모집 중</option>
                    <option value="closing">마감 임박</option>
                  </select>
                </Field>
                <Field label="썸네일 URL (선택)">
                  <input style={inputStyle} value={form.thumbnailUrl} onChange={(e) => set("thumbnailUrl", e.target.value)} placeholder="비워두면 인플루언서 이미지 사용" />
                </Field>
              </div>
            </Section>

            {/* 일정 */}
            <Section title="일정">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <Field label="모집 마감일 *">
                  <input type="date" style={inputStyle} value={form.recruitDeadline} onChange={(e) => set("recruitDeadline", e.target.value)} />
                </Field>
                <Field label="촬영일 *">
                  <input type="date" style={inputStyle} value={form.shootingDate} onChange={(e) => set("shootingDate", e.target.value)} />
                </Field>
                <Field label="게시일 *">
                  <input type="date" style={inputStyle} value={form.publishDate} onChange={(e) => set("publishDate", e.target.value)} />
                </Field>
              </div>
            </Section>

            {/* 슬롯 / 가격 */}
            <Section title="슬롯 / 가격">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <Field label={mode === "edit" ? "슬롯 수 (수정 불가)" : "슬롯 수 *"}>
                  <input
                    type="number" min={1} max={10}
                    style={{ ...inputStyle, backgroundColor: mode === "edit" ? "#f9fafb" : undefined }}
                    value={form.totalSlots}
                    onChange={(e) => set("totalSlots", Number(e.target.value))}
                    disabled={mode === "edit"}
                  />
                </Field>
                <Field label="슬롯당 가격 (원) *">
                  <input type="number" style={inputStyle} value={form.perSlotCost || ""} onChange={(e) => set("perSlotCost", Number(e.target.value))} placeholder="ex. 4000000" />
                </Field>
                <Field label="총 가격 (자동계산)">
                  <div style={{ ...inputStyle, backgroundColor: "#f9fafb", color: "#374151", display: "flex", alignItems: "center" }}>
                    {totalCost > 0 ? `${(totalCost / 10000).toLocaleString("ko-KR")}만원` : "—"}
                  </div>
                </Field>
              </div>
            </Section>

            {/* 컨텐츠 가이드 */}
            <Section title="컨텐츠 가이드">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {form.contentGuide.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      value={item}
                      onChange={(e) => setGuide(i, e.target.value)}
                      placeholder={`가이드 ${i + 1}`}
                    />
                    <button onClick={() => removeGuide(i)} disabled={form.contentGuide.length <= 1} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: "4px" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={addGuide} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "1px dashed #d1d5db", borderRadius: "6px", padding: "7px 12px", fontSize: "12px", color: "#9ca3af", cursor: "pointer" }}>
                  <Plus size={12} /> 항목 추가
                </button>
              </div>
            </Section>

            {/* 금지사항 */}
            <Section title="금지사항">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {form.restrictions.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      value={item}
                      onChange={(e) => setRestriction(i, e.target.value)}
                      placeholder={`금지사항 ${i + 1}`}
                    />
                    <button onClick={() => removeRestriction(i)} disabled={form.restrictions.length <= 1} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: "4px" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={addRestriction} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "1px dashed #d1d5db", borderRadius: "6px", padding: "7px 12px", fontSize: "12px", color: "#9ca3af", cursor: "pointer" }}>
                  <Plus size={12} /> 항목 추가
                </button>
              </div>
            </Section>

          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f3f4f6", flexShrink: 0, display: "flex", gap: "10px", alignItems: "center" }}>
          {error && <p style={{ fontSize: "13px", color: "#dc2626", flex: 1 }}>{error}</p>}
          {!error && <div style={{ flex: 1 }} />}
          <button onClick={onClose} style={{ padding: "9px 20px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", color: "#6b7280", cursor: "pointer" }}>
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: "9px 24px", backgroundColor: saving ? "#9ca3af" : "#111", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: saving ? "default" : "pointer" }}
          >
            {saving ? "저장 중..." : mode === "create" ? "캠페인 등록" : "수정 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", letterSpacing: "0.06em", marginBottom: "10px" }}>{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "7px",
  padding: "8px 10px",
  fontSize: "13px",
  color: "#111",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: "28px",
  cursor: "pointer",
};
