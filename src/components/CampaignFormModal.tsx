"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export interface CampaignEditData {
  id: string;
  influencerId: string;
  influencerName: string;
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
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  // 인플루언서 (create 전용)
  infName: string;
  infHandle: string;
  infPlatform: "youtube" | "instagram" | "tiktok" | "xiaohongshu";
  infFollowers: string;
  infCategory: string;
  infProfileUrl: string;
  infThumbnailUrl: string;
  // 캠페인
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

const emptyForm: FormState = {
  infName: "", infHandle: "", infPlatform: "youtube", infFollowers: "",
  infCategory: "", infProfileUrl: "", infThumbnailUrl: "",
  contentTitle: "", contentType: "", recruitDeadline: "",
  shootingDate: "", publishDate: "",
  totalSlots: 5, perSlotCost: 0,
  country: "us", thumbnailUrl: "", status: "open",
  contentGuide: [""], restrictions: [""],
};

export default function CampaignFormModal({ mode, existing, onClose, onSaved }: Props) {
  const supabase = createClient();

  const [form, setForm] = useState<FormState>(() =>
    mode === "edit" && existing
      ? {
          ...emptyForm,
          contentTitle: existing.contentTitle,
          contentType: existing.contentType,
          recruitDeadline: existing.recruitDeadline,
          shootingDate: existing.shootingDate,
          publishDate: existing.publishDate,
          totalSlots: existing.totalSlots,
          perSlotCost: existing.perSlotCost,
          country: existing.country,
          thumbnailUrl: existing.thumbnailUrl,
          status: existing.status,
          contentGuide: existing.contentGuide.length > 0 ? existing.contentGuide : [""],
          restrictions: existing.restrictions.length > 0 ? existing.restrictions : [""],
        }
      : { ...emptyForm }
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setGuide = (i: number, val: string) =>
    setForm((p) => { const a = [...p.contentGuide]; a[i] = val; return { ...p, contentGuide: a }; });
  const addGuide = () => setForm((p) => ({ ...p, contentGuide: [...p.contentGuide, ""] }));
  const removeGuide = (i: number) =>
    setForm((p) => ({ ...p, contentGuide: p.contentGuide.filter((_, idx) => idx !== i) }));

  const setRestriction = (i: number, val: string) =>
    setForm((p) => { const a = [...p.restrictions]; a[i] = val; return { ...p, restrictions: a }; });
  const addRestriction = () => setForm((p) => ({ ...p, restrictions: [...p.restrictions, ""] }));
  const removeRestriction = (i: number) =>
    setForm((p) => ({ ...p, restrictions: p.restrictions.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (mode === "create") {
      if (!form.infName || !form.infHandle || !form.infThumbnailUrl) {
        setError("인플루언서 이름, 핸들, 썸네일 URL은 필수입니다.");
        return;
      }
    }
    if (!form.contentTitle || !form.contentType || !form.recruitDeadline || !form.shootingDate || !form.publishDate || !form.perSlotCost) {
      setError("필수 항목(*)을 모두 입력해주세요.");
      return;
    }

    setSaving(true);
    setError("");

    const guideArr = form.contentGuide.filter((g) => g.trim() !== "");
    const restrictArr = form.restrictions.filter((r) => r.trim() !== "");

    const campaignPayload = {
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
      // 1. 인플루언서 생성
      const { data: inf, error: infErr } = await supabase
        .from("influencers")
        .insert({
          name: form.infName,
          handle: form.infHandle,
          platform: form.infPlatform,
          followers: form.infFollowers,
          category: form.infCategory || null,
          profile_url: form.infProfileUrl || null,
          thumbnail_url: form.infThumbnailUrl,
          country: form.country,
        })
        .select("id")
        .single();

      if (infErr || !inf) {
        setError("인플루언서 저장 중 오류가 발생했습니다.");
        setSaving(false);
        return;
      }

      // 2. 캠페인 생성
      const { data: camp, error: campErr } = await supabase
        .from("campaigns")
        .insert({ ...campaignPayload, influencer_id: inf.id })
        .select("id")
        .single();

      if (campErr || !camp) {
        setError("캠페인 저장 중 오류가 발생했습니다.");
        setSaving(false);
        return;
      }

      // 3. 슬롯 생성
      await supabase.from("slots").insert(
        Array.from({ length: form.totalSlots }, (_, i) => ({
          campaign_id: camp.id,
          slot_number: i + 1,
          status: "available",
        }))
      );
    } else {
      const { error: updErr } = await supabase
        .from("campaigns")
        .update(campaignPayload)
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
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#111", letterSpacing: "-0.03em" }}>
              {mode === "create" ? "새 캠페인 등록" : "캠페인 수정"}
            </h2>
            {mode === "edit" && existing && (
              <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>인플루언서: {existing.influencerName}</p>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* ── 인플루언서 (create 전용) ── */}
            {mode === "create" && (
              <Section title="인플루언서 정보">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <Field label="이름 *">
                    <input style={inputStyle} value={form.infName} onChange={(e) => set("infName", e.target.value)} placeholder="ex. 화장하는 청담언니" />
                  </Field>
                  <Field label="핸들 *">
                    <input style={inputStyle} value={form.infHandle} onChange={(e) => set("infHandle", e.target.value)} placeholder="ex. @cookingmua" />
                  </Field>
                  <Field label="플랫폼 *">
                    <select style={selectStyle} value={form.infPlatform} onChange={(e) => set("infPlatform", e.target.value as FormState["infPlatform"])}>
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="xiaohongshu">Xiaohongshu</option>
                    </select>
                  </Field>
                  <Field label="팔로워">
                    <input style={inputStyle} value={form.infFollowers} onChange={(e) => set("infFollowers", e.target.value)} placeholder="ex. 182만" />
                  </Field>
                  <Field label="카테고리">
                    <input style={inputStyle} value={form.infCategory} onChange={(e) => set("infCategory", e.target.value)} placeholder="ex. 라이프스타일 / 건강" />
                  </Field>
                  <Field label="프로필 URL">
                    <input style={inputStyle} value={form.infProfileUrl} onChange={(e) => set("infProfileUrl", e.target.value)} placeholder="ex. https://youtube.com/@..." />
                  </Field>
                  <Field label="썸네일 URL *">
                    <input style={{ ...inputStyle, gridColumn: "span 2" }} value={form.infThumbnailUrl} onChange={(e) => set("infThumbnailUrl", e.target.value)} placeholder="프로필 이미지 URL" />
                  </Field>
                </div>
              </Section>
            )}

            {/* ── 캠페인 기본 정보 ── */}
            <Section title="캠페인 기본 정보">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Field label="캠페인명 *">
                  <input style={inputStyle} value={form.contentTitle} onChange={(e) => set("contentTitle", e.target.value)} placeholder="ex. 약국 브이로그 – 건강 루틴" />
                </Field>
                <Field label="컨텐츠 타입 *">
                  <input style={inputStyle} value={form.contentType} onChange={(e) => set("contentType", e.target.value)} placeholder="ex. 약국 방문 촬영 브이로그" />
                </Field>
                <Field label="국가 *">
                  <select style={selectStyle} value={form.country} onChange={(e) => set("country", e.target.value as FormState["country"])}>
                    <option value="us">US</option>
                    <option value="jp">JAPAN</option>
                    <option value="cn">CHINA</option>
                  </select>
                </Field>
                <Field label="상태">
                  <select style={selectStyle} value={form.status} onChange={(e) => set("status", e.target.value as FormState["status"])}>
                    <option value="open">모집 중</option>
                    <option value="closing">마감 임박</option>
                  </select>
                </Field>
                <Field label="캠페인 썸네일 URL (선택)">
                  <input style={inputStyle} value={form.thumbnailUrl} onChange={(e) => set("thumbnailUrl", e.target.value)} placeholder="비워두면 인플루언서 이미지 사용" />
                </Field>
              </div>
            </Section>

            {/* ── 일정 ── */}
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

            {/* ── 슬롯 / 가격 ── */}
            <Section title="슬롯 / 가격">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <Field label={mode === "edit" ? "슬롯 수 (수정 불가)" : "슬롯 수 *"}>
                  <input
                    type="number" min={1} max={10}
                    style={{ ...inputStyle, backgroundColor: mode === "edit" ? "#f9fafb" : undefined, color: mode === "edit" ? "#9ca3af" : undefined }}
                    value={form.totalSlots}
                    onChange={(e) => set("totalSlots", Number(e.target.value))}
                    disabled={mode === "edit"}
                  />
                </Field>
                <Field label="슬롯당 가격 (원) *">
                  <input type="number" style={inputStyle} value={form.perSlotCost || ""} onChange={(e) => set("perSlotCost", Number(e.target.value))} placeholder="ex. 4000000" />
                </Field>
                <Field label="총 가격 (자동)">
                  <div style={{ ...inputStyle, backgroundColor: "#f9fafb", color: "#374151", display: "flex", alignItems: "center", height: "36px" }}>
                    {totalCost > 0 ? `${(totalCost / 10000).toLocaleString("ko-KR")}만원` : "—"}
                  </div>
                </Field>
              </div>
            </Section>

            {/* ── 컨텐츠 가이드 ── */}
            <Section title="컨텐츠 가이드">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {form.contentGuide.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input style={{ ...inputStyle, flex: 1 }} value={item} onChange={(e) => setGuide(i, e.target.value)} placeholder={`가이드 ${i + 1}`} />
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

            {/* ── 금지사항 ── */}
            <Section title="금지사항">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {form.restrictions.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input style={{ ...inputStyle, flex: 1 }} value={item} onChange={(e) => setRestriction(i, e.target.value)} placeholder={`금지사항 ${i + 1}`} />
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
      <p style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", letterSpacing: "0.06em", marginBottom: "10px", textTransform: "uppercase" }}>{title}</p>
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
