import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "influencer-thumbnails";

async function ensureBucket() {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error && !error.message.includes("already exists")) throw error;
}

async function uploadAndUpdate(influencerId: string, imagePath: string) {
  const ext = path.extname(imagePath).toLowerCase() || ".jpg";
  const fileName = `${influencerId}${ext}`;
  const fileBuffer = fs.readFileSync(imagePath);
  const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  // 1. Storage 업로드 (덮어쓰기)
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, fileBuffer, { contentType: mimeType, upsert: true });

  if (uploadErr) throw new Error(`업로드 실패: ${uploadErr.message}`);

  // 2. 공개 URL 생성
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;

  // 3. influencers + campaigns thumbnail_url 업데이트
  const { error: infErr } = await supabase
    .from("influencers")
    .update({ thumbnail_url: publicUrl })
    .eq("id", influencerId);

  if (infErr) throw new Error(`influencers 업데이트 실패: ${infErr.message}`);

  const { error: campErr } = await supabase
    .from("campaigns")
    .update({ thumbnail_url: publicUrl })
    .eq("influencer_id", influencerId);

  if (campErr) throw new Error(`campaigns 업데이트 실패: ${campErr.message}`);

  console.log(`✓ ${influencerId} → ${publicUrl}`);
}

// CLI: npx tsx scripts/update-thumbnail.ts <influencer_id> <image_path>
const [,, influencerId, imagePath] = process.argv;

if (!influencerId || !imagePath) {
  console.error("사용법: npx tsx scripts/update-thumbnail.ts <influencer_id> <image_path>");
  process.exit(1);
}

ensureBucket().then(() => uploadAndUpdate(influencerId, imagePath)).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
