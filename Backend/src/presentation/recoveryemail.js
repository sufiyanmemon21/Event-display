export default function recoveryEmail(otp) {
  const subject = "Your EventSphere verification code";
  const text = [
    "EventSphere",
    "Password Reset Verification",
    "We received a request to reset your EventSphere password.",
    "Your verification code: " + otp,
    "This code expires in 10 minutes.",
    "If you didn’t request a password reset, you can ignore this email.",
    "EventSphere · Beautifully planned. Joyfully celebrated.",
  ].join("\n\n");

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;background-color:#f6ede2;color:#3b2a24;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f6ede2" style="width:100%;background-color:#f6ede2;">
    <tr><td align="center" style="padding:28px 12px;">
      <!--[if mso]><table role="presentation" width="540" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#fffaf4" style="width:100%;max-width:540px;background-color:#fffaf4;border:1px solid #e3cfb6;border-top:4px solid #b7956f;border-radius:14px;text-align:center;">
        <tr><td style="padding:36px 20px 28px;">
          <p style="margin:0 0 22px;color:#76523c;font-family:Georgia,serif;font-size:25px;">EventSphere</p>
          <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:29px;font-weight:normal;line-height:1.2;color:#3b2a24;">Password Reset Verification</h1>
          <p style="margin:0 0 24px;color:#654d41;font-size:15px;line-height:1.6;">We received a request to reset your EventSphere password.</p>
          <table role="presentation" align="center" cellspacing="0" cellpadding="0" bgcolor="#f2e4d2" style="margin:0 auto;background-color:#f2e4d2;border:1px solid #dfc5a6;border-radius:8px;">
            <tr><td style="padding:15px 18px;">
              <p style="margin:0 0 7px;color:#654735;font-size:12px;font-weight:bold;">Your verification code</p>
              <p style="margin:0;color:#3b2a24;font-family:'Courier New',monospace;font-weight:bold;font-size:34px;line-height:1.2;letter-spacing:4px;">${otp}</p>
            </td></tr>
          </table>
          <p style="margin:18px 0 8px;color:#654d41;font-size:14px;line-height:1.5;">This code expires in 10 minutes.</p>
          <p style="margin:0;color:#654d41;font-size:14px;line-height:1.5;">If you didn’t request a password reset, you can ignore this email.</p>
        </td></tr>
        <tr><td bgcolor="#f8efe4" style="padding:16px 14px;border-top:1px solid #e3cfb6;background-color:#f8efe4;color:#654735;font-size:12px;line-height:1.5;">
          <strong>EventSphere</strong> &middot; Beautifully planned. Joyfully celebrated.
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}
