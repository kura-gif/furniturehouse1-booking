import nodemailer from "nodemailer";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  const { name, company, email, phone, message } = body;

  if (!name || !email || !message) {
    throw createError({
      statusCode: 400,
      message: "必須項目を入力してください",
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });

  const mailContent = `
【お問い合わせ】株式会社クラドニ ウェブサイトより

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ お名前
${name}

■ 会社名
${company || "未入力"}

■ メールアドレス
${email}

■ 電話番号
${phone || "未入力"}

■ お問い合わせ内容
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  try {
    await transporter.sendMail({
      from: config.emailUser,
      to: "info@chladni.co.jp",
      replyTo: email,
      subject: `【お問い合わせ】${name}様より - 株式会社クラドニ`,
      text: mailContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    throw createError({
      statusCode: 500,
      message: "メール送信に失敗しました",
    });
  }
});
