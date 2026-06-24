export type SlotStatus = "available" | "reserved" | "filled";
export type ApplicationStatus =
  | "pending"           // 신청 중 — 검토 대기
  | "approved"          // 승인됨 — 인보이스 발행, 송금 예정일 입력 필요
  | "payment_pending"   // 입금 대기 — 예정일 입력 완료, 송금 전
  | "payment_confirming"// 입금 확인 중 — 송금 완료 클릭 후
  | "active"            // 진행 중 — 입금 확인 완료
  | "completed"         // 완료
  | "rejected";         // 반려

export interface MyApplication {
  id: string;
  campaignId: string;
  slotId: number;
  status: ApplicationStatus;
  appliedAt: string;
  companyName: string;
  brandName: string;
  productName: string;
  invoiceNumber?: string;
  invoiceIssuedAt?: string;
  paymentDueDate?: string;
  expectedPaymentDate?: string;
}

export interface Slot {
  id: number;
  status: SlotStatus;
  brandName?: string;
  brandLogo?: string;
}

export interface Campaign {
  id: string;
  influencer: {
    name: string;
    handle: string;
    platform: "youtube" | "instagram" | "tiktok" | "xiaohongshu";
    followers: string;
    category: string;
    thumbnailUrl: string;
    profileUrl: string;
  };
  contentTitle: string;
  contentType: string;
  recruitDeadline: string;
  shootingDate: string;
  publishDate: string;
  totalSlots: number;
  slots: Slot[];
  totalCost: number;
  perSlotCost: number;
  contentGuide: string[];
  restrictions: string[];
  status: "open" | "closing";
  country: "us" | "jp" | "cn";
}

export interface BrandApplication {
  campaignId: string;
  slotId: number;
  companyName: string;
  brandName: string;
  productName: string;
  productUrl: string;
  productDescription: string;
  exposurePoint: string;
  referenceVideoUrl: string;
  precautions: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  budget: string;
}
