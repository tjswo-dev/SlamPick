import { createClient } from "@/lib/supabase";
import { Campaign } from "@/lib/types";

export async function fetchCampaigns(): Promise<Campaign[]> {
  const supabase = createClient();

  // 1. campaigns 단독 조회
  const { data: campData, error: campErr } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (campErr || !campData) {
    console.error("[fetchCampaigns] campaigns error:", campErr);
    throw new Error(`campaigns 조회 실패: ${campErr?.message}`);
  }

  if (campData.length === 0) return [];

  // 2. influencers 단독 조회
  const influencerIds = [...new Set(campData.map((c) => c.influencer_id).filter(Boolean))];
  const { data: infData, error: infErr } = await supabase
    .from("influencers")
    .select("*")
    .in("id", influencerIds);

  if (infErr) {
    console.error("[fetchCampaigns] influencers error:", infErr);
    throw new Error(`influencers 조회 실패: ${infErr?.message}`);
  }

  // 3. slots 단독 조회
  const campaignIds = campData.map((c) => c.id);
  const { data: slotData, error: slotErr } = await supabase
    .from("slots")
    .select("*")
    .in("campaign_id", campaignIds);

  if (slotErr) {
    console.error("[fetchCampaigns] slots error:", slotErr);
    throw new Error(`slots 조회 실패: ${slotErr?.message}`);
  }

  // 4. JS에서 합치기
  const infMap: Record<string, typeof infData[0]> = {};
  (infData ?? []).forEach((i) => { infMap[i.id] = i; });

  const slotMap: Record<string, typeof slotData> = {};
  (slotData ?? []).forEach((s) => {
    if (!slotMap[s.campaign_id]) slotMap[s.campaign_id] = [];
    slotMap[s.campaign_id].push(s);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return campData.flatMap((row: any) => {
    const influencer = infMap[row.influencer_id];
    if (!influencer) {
      console.warn("[fetchCampaigns] influencer not found for campaign", row.id, "influencer_id:", row.influencer_id);
      return [];
    }
    const slots = (slotMap[row.id] ?? [])
      .sort((a: { slot_number: number }, b: { slot_number: number }) => a.slot_number - b.slot_number)
      .map((s: { slot_number: number; status: string; brand_name?: string }) => ({
        id: s.slot_number,
        status: s.status as "available" | "reserved" | "filled",
        brandName: s.brand_name ?? undefined,
      }));

    return [{
      id: row.id,
      influencer: {
        name: influencer.name ?? "",
        handle: influencer.handle ?? "",
        platform: influencer.platform ?? "youtube",
        followers: influencer.followers ?? "",
        likesAndSaves: influencer.likes_saves ?? undefined,
        category: influencer.category ?? "",
        thumbnailUrl: row.thumbnail_url || influencer.thumbnail_url || "",
        profileUrl: influencer.profile_url ?? "",
      },
      contentTitle: row.content_title,
      contentType: row.content_type,
      recruitDeadline: row.recruit_deadline,
      shootingDate: row.shooting_date,
      publishDate: row.publish_date,
      totalSlots: row.total_slots,
      slots,
      totalCost: row.total_cost,
      perSlotCost: row.per_slot_cost,
      contentGuide: (row.content_guide as string[]) ?? [],
      restrictions: (row.restrictions as string[]) ?? [],
      status: row.status as "open" | "closing",
      country: row.country as "us" | "jp" | "cn",
    }];
  });
}
