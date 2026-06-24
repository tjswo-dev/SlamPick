"use client";

import { X, Download } from "lucide-react";
import { Campaign, MyApplication } from "@/lib/types";

interface InvoiceModalProps {
  application: MyApplication;
  campaign: Campaign;
  onClose: () => void;
}

export default function InvoiceModal({ application, campaign, onClose }: InvoiceModalProps) {
  const supply = campaign.perSlotCost;
  const vat = Math.round(supply * 0.1);
  const total = supply + vat;

  const handlePrint = () => window.print();

  return (
    <div
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1100, padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="invoice-print-area"
        style={{
          backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb",
          width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.08em", marginBottom: "4px" }}>
              세금계산서
            </p>
            <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#111", letterSpacing: "-0.03em" }}>
              인보이스
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "#9ca3af", display: "flex", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; e.currentTarget.style.color = "#374151"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#9ca3af"; }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Invoice meta */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <MetaRow label="인보이스 번호" value={application.invoiceNumber!} accent />
            <MetaRow label="발행일"        value={application.invoiceIssuedAt!} />
            <MetaRow label="납부 기한"     value={application.paymentDueDate!} accent />
            <MetaRow label="슬롯"          value={`#${application.slotId}`} />
          </div>

          {/* From / To */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <PartyBox title="발행자"  name="SLAM GLOBAL Inc." sub="사업자번호: 000-00-00000" />
            <PartyBox title="청구처"  name={application.companyName} sub={`브랜드: ${application.brandName}`} />
          </div>

          {/* Item table */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", backgroundColor: "#f9fafb", padding: "10px 16px", borderBottom: "1px solid #e5e7eb" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af" }}>항목</span>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", textAlign: "right", minWidth: "80px" }}>단가</span>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", textAlign: "right", minWidth: "80px" }}>금액</span>
            </div>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#111", marginBottom: "2px" }}>{campaign.contentTitle}</p>
                  <p style={{ fontSize: "11px", color: "#9ca3af" }}>{campaign.influencer.name} · 슬롯 #{application.slotId}</p>
                </div>
                <span style={{ fontSize: "13px", color: "#374151", textAlign: "right", minWidth: "80px" }}>
                  {(supply / 10000).toLocaleString("ko-KR")}만원
                </span>
                <span style={{ fontSize: "13px", color: "#374151", textAlign: "right", minWidth: "80px" }}>
                  {(supply / 10000).toLocaleString("ko-KR")}만원
                </span>
              </div>
            </div>
            {/* Totals */}
            <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>공급가액</span>
                <span style={{ fontSize: "12px", color: "#374151" }}>{supply.toLocaleString("ko-KR")}원</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>부가세 (10%)</span>
                <span style={{ fontSize: "12px", color: "#374151" }}>{vat.toLocaleString("ko-KR")}원</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#111" }}>합계</span>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#111" }}>{(total / 10000).toLocaleString("ko-KR")}만원</span>
              </div>
            </div>
          </div>

          {/* Bank account */}
          <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px 16px" }}>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", letterSpacing: "0.06em", marginBottom: "10px" }}>
              계좌 이체 안내
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <BankRow label="은행"     value="신한은행" />
              <BankRow label="계좌번호" value="110-123-456789" />
              <BankRow label="예금주"   value="SLAM GLOBAL Inc." />
              <BankRow label="납부 기한" value={application.paymentDueDate!} highlight />
            </div>
          </div>

          {/* Download button */}
          <button
            style={{
              width: "100%", padding: "12px", backgroundColor: "#111", color: "#fff",
              border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "6px", transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#111")}
            onClick={handlePrint}
          >
            <Download size={14} /> PDF 저장 (인쇄)
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ backgroundColor: accent ? "#f8f9fb" : "transparent", border: "1px solid #f3f4f6", borderRadius: "8px", padding: "10px 12px" }}>
      <p style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", marginBottom: "3px" }}>{label}</p>
      <p style={{ fontSize: "13px", fontWeight: "700", color: "#111" }}>{value}</p>
    </div>
  );
}

function PartyBox({ title, name, sub }: { title: string; name: string; sub: string }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px 14px" }}>
      <p style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.04em", marginBottom: "6px" }}>{title}</p>
      <p style={{ fontSize: "13px", fontWeight: "700", color: "#111", marginBottom: "2px" }}>{name}</p>
      <p style={{ fontSize: "11px", color: "#9ca3af" }}>{sub}</p>
    </div>
  );
}

function BankRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "12px", color: "#9ca3af" }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: highlight ? "700" : "500", color: highlight ? "#dc2626" : "#374151" }}>{value}</span>
    </div>
  );
}
