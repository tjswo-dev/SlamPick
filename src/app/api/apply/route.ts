import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { brand, manager, email, phone } = await req.json();

  if (!brand || !manager || !email || !phone) {
    return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "SLAM PICK <onboarding@resend.dev>",
    to: "tjswo@slam-global.com",
    subject: `[마케팅 신청] ${brand}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #111;">
        <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 8px;">마케팅 신청이 접수되었습니다</h2>
        <p style="color: #888; font-size: 13px; margin: 0 0 32px;">SLAM PICK을 통해 새로운 신청이 들어왔습니다.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 14px 0; font-size: 13px; color: #888; width: 100px;">브랜드명</td>
            <td style="padding: 14px 0; font-size: 15px; font-weight: 600;">${brand}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 14px 0; font-size: 13px; color: #888;">담당자명</td>
            <td style="padding: 14px 0; font-size: 15px; font-weight: 600;">${manager}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 14px 0; font-size: 13px; color: #888;">이메일</td>
            <td style="padding: 14px 0; font-size: 15px; font-weight: 600;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; font-size: 13px; color: #888;">전화번호</td>
            <td style="padding: 14px 0; font-size: 15px; font-weight: 600;">${phone}</td>
          </tr>
        </table>
        <p style="margin-top: 32px; font-size: 12px; color: #bbb;">신청 시각: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: "이메일 발송에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
