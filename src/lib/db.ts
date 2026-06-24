import { createClient } from "@/lib/supabase";
import { Campaign } from "@/lib/types";

export async function fetchCampaigns(): Promise<Campaign[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select(`*, influencer:influencers(*), slots(*)`)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[fetchCampaigns] error:", error);
    return [];
  }

  return data.map((row) => ({
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
    slots: [...row.slots]
      .sort((a: { slot_number: number }, b: { slot_number: number }) => a.slot_number - b.slot_number)
      .map((s: { slot_number: number; status: string; brand_name?: string }) => ({
        id: s.slot_number,
        status: s.status as "available" | "reserved" | "filled",
        brandName: s.brand_name ?? undefined,
      })),
    totalCost: row.total_cost,
    perSlotCost: row.per_slot_cost,
    contentGuide: row.content_guide as string[],
    restrictions: row.restrictions as string[],
    status: row.status as "open" | "closing",
    country: row.country as "us" | "jp" | "cn",
  }));
}
