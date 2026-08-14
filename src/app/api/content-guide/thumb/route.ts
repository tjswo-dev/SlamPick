import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (!/(^|\.)instagram\.com$/i.test(target.hostname)) {
    return NextResponse.json({ error: "instagram only" }, { status: 400 });
  }

  // Prefer the classic media redirect endpoint
  const short = target.pathname.match(/\/(?:p|reel|tv)\/([^/]+)/)?.[1];
  if (short) {
    try {
      const media = await fetch(
        `https://www.instagram.com/p/${short}/media/?size=l`,
        {
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; SlamPickBot/1.0; +https://slampick.local)",
            Accept: "image/*,*/*",
          },
          next: { revalidate: 60 * 60 * 24 },
        }
      );
      const type = media.headers.get("content-type") ?? "";
      if (media.ok && type.startsWith("image/")) {
        const buf = await media.arrayBuffer();
        return new NextResponse(buf, {
          headers: {
            "Content-Type": type,
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    } catch {
      // fall through to og:image
    }
  }

  try {
    const page = await fetch(target.toString().replace(/\/embed\/?$/, "/"), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SlamPickBot/1.0; +https://slampick.local)",
        Accept: "text/html",
      },
      next: { revalidate: 60 * 60 * 24 },
    });
    const html = await page.text();
    const og =
      html.match(
        /property=["']og:image["']\s+content=["']([^"']+)["']/i
      )?.[1] ||
      html.match(
        /content=["']([^"']+)["']\s+property=["']og:image["']/i
      )?.[1];

    if (og) {
      return NextResponse.redirect(og, 302);
    }
  } catch {
    // ignore
  }

  return NextResponse.json({ error: "thumbnail not found" }, { status: 404 });
}
