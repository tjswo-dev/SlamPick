# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

ROOT = Path(r"c:\Users\Eunbeern\Desktop\WORK\Brand_slam\slampick-ext")
with open(ROOT / "tmp-excel-dump.json", encoding="utf-8") as f:
    data = json.load(f)


def embed(url):
    if not url:
        return None
    url = url.strip().rstrip("/")
    if "instagram.com" in url:
        return url + "/embed/"
    return url


def thumbnail(url):
    if not url:
        return None
    m = re.search(r"instagram\.com/(?:p|reel|tv)/([^/?#]+)", url)
    if not m:
        return None
    code = m.group(1)
    # Instagram media redirect — used as preview; UI falls back if blocked
    return f"https://www.instagram.com/p/{code}/media/?size=l"


def esc(s):
    if s is None:
        s = ""
    return json.dumps(str(s), ensure_ascii=False)


def code_prefix(concept):
    m = re.match(r"^([A-Z]+)-\d+", concept or "")
    return m.group(1) if m else ""


MAP = {
    "J": "visit",
    "M": "visit",
    "K": "derma",
    "L": "seeding",
    "A": "derma",
    "B": "pharmacist",
    "C": "pharmacist",
    "D": "visit",
    "E": "seeding",
    "F": "seeding",
}
N_MAP = {"N-1": "pharmacist", "N-2": "derma", "N-3": "visit"}

buckets = {k: [] for k in ["visit", "pharmacist", "derma", "seeding"]}
for sheet, payload in data.items():
    for row in payload["rows"]:
        concept = (row.get("컨셉") or "").strip()
        pref = code_prefix(concept)
        key3 = concept.split()[0] if concept else ""
        sid = N_MAP.get(key3) or MAP.get(pref)
        if not sid:
            continue
        title = re.sub(r"^[A-Z]+-\d+\s*", "", concept).strip() or concept
        desc = (row.get("컨셉 설명") or "").strip()
        caption = (row.get("매칭 캡션(요약)") or "").strip()
        raw_url = row.get("영상 URL")
        video_url = embed(raw_url)
        buckets[sid].append(
            {
                "title": title,
                "videoUrl": video_url,
                "thumbnail": thumbnail(raw_url or video_url or ""),
                "matchedCaption": caption,
                "concept": desc,
                "summary": desc,
                "description": "실제 레퍼런스 영상과 매칭 캡션 패턴을 기준으로, 같은 콘셉트의 콘텐츠를 제작할 때 참고하세요.",
            }
        )

META = {
    "visit": {
        "shortLabel": "OWM 방문형",
        "ctaSubtitle": "OWM 방문형 콘텐츠의 제작 방향을 확인해보세요.",
        "listTitle": "OWM 방문형 콘텐츠 제작 방향",
    },
    "pharmacist": {
        "shortLabel": "약사 신뢰형",
        "ctaSubtitle": "약사 신뢰형 콘텐츠의 제작 방향을 확인해보세요.",
        "listTitle": "약사 신뢰형 콘텐츠 제작 방향",
    },
    "derma": {
        "shortLabel": "피부과 연계",
        "ctaSubtitle": "피부과 연계 콘텐츠의 제작 방향을 확인해보세요.",
        "listTitle": "피부과 연계 콘텐츠 제작 방향",
    },
    "seeding": {
        "shortLabel": "시딩",
        "ctaSubtitle": "시딩 콘텐츠의 제작 방향을 확인해보세요.",
        "listTitle": "시딩 콘텐츠 제작 방향",
    },
}

lines = []
lines.append("export interface ContentGuideItem {")
lines.append("  id: string;")
lines.append("  index: number;")
lines.append("  title: string;")
lines.append("  /** Collapsed card summary */")
lines.append("  summary: string;")
lines.append("  concept: string;")
lines.append("  description: string;")
lines.append("  matchedCaption: string;")
lines.append("  videoDuration: string;")
lines.append("  thumbnail?: string;")
lines.append("  videoUrl?: string;")
lines.append("}")
lines.append("")
lines.append("export interface ContentGuideMeta {")
lines.append("  serviceId: string;")
lines.append("  shortLabel: string;")
lines.append("  ctaSubtitle: string;")
lines.append("  listTitle: string;")
lines.append("  guides: ContentGuideItem[];")
lines.append("}")
lines.append("")
lines.append("export const CONTENT_GUIDES: Record<string, ContentGuideMeta> = {")

for sid, items in buckets.items():
    m = META[sid]
    lines.append(f"  {sid}: {{")
    lines.append(f'    serviceId: "{sid}",')
    lines.append(f"    shortLabel: {esc(m['shortLabel'])},")
    lines.append(f"    ctaSubtitle: {esc(m['ctaSubtitle'])},")
    lines.append(f"    listTitle: {esc(m['listTitle'])},")
    lines.append("    guides: [")
    for i, g in enumerate(items, 1):
        n = str(i).zfill(2)
        lines.append("      {")
        lines.append(f'        id: "{sid}-{n}",')
        lines.append(f"        index: {i},")
        lines.append(f"        title: {esc(g['title'])},")
        lines.append(f"        summary: {esc(g['summary'])},")
        lines.append(f"        concept: {esc(g['concept'])},")
        lines.append(f"        description: {esc(g['description'])},")
        lines.append(f"        matchedCaption: {esc(g['matchedCaption'])},")
        lines.append('        videoDuration: "—",')
        lines.append(f"        thumbnail: {esc(g['thumbnail'])},")
        lines.append(f"        videoUrl: {esc(g['videoUrl'])},")
        lines.append("      },")
    lines.append("    ],")
    lines.append("  },")

lines.append("};")
lines.append("")
lines.append("export const ANALYZE_STEPS = [")
lines.append("  {")
lines.append('    label: "레퍼런스 추출",')
lines.append('    status: "API에서 레퍼런스 추출 중...",')
lines.append("  },")
lines.append("  {")
lines.append('    label: "캡션 분석",')
lines.append('    status: "캡션 데이터 분석 중...",')
lines.append("  },")
lines.append("  {")
lines.append('    label: "콘셉트 구성",')
lines.append('    status: "콘텐츠 콘셉트 정리 중...",')
lines.append("  },")
lines.append("] as const;")
lines.append("")
lines.append("export function isValidGuideServiceId(id: string): boolean {")
lines.append("  return id in CONTENT_GUIDES;")
lines.append("}")
lines.append("")

out = ROOT / "src" / "lib" / "content-guides.ts"
out.write_text("\n".join(lines), encoding="utf-8")
print("written", out)
print({k: len(v) for k, v in buckets.items()})
