export function otpEmailTemplate({ code, expiresInMinutes }: { code: string; expiresInMinutes: number }) {
  const subject = "Your REHOBOTH verification code";

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
            <tr>
              <td style="background-color:#FF1400;padding:24px 32px;text-align:center;">
                <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:1px;">REHOBOTH</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;color:#18181b;">Verify your email</h1>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#52525b;">
                  Use the code below to finish creating your REHOBOTH account. This code expires in
                  ${expiresInMinutes} minutes.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="padding:18px;background-color:#f4f4f5;border-radius:8px;text-align:center;">
                      <span style="font-family:'Courier New', monospace;font-size:32px;font-weight:bold;letter-spacing:8px;color:#18181b;">${code}</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#a1a1aa;">
                  Didn&#39;t request this code? You can safely ignore this email &mdash; your account is still secure.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
                <p style="margin:0;font-size:12px;color:#a1a1aa;">REHOBOTH Business Management System</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `Verify your email

Use the code below to finish creating your REHOBOTH account. This code expires in ${expiresInMinutes} minutes.

${code}

Didn't request this code? You can safely ignore this email — your account is still secure.

REHOBOTH Business Management System`;

  return { subject, html, text };
}

export function passwordResetEmailTemplate({
  resetLink,
  expiresInMinutes,
}: {
  resetLink: string;
  expiresInMinutes: number;
}) {
  const subject = "Reset your REHOBOTH password";

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
            <tr>
              <td style="background-color:#FF1400;padding:24px 32px;text-align:center;">
                <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:1px;">REHOBOTH</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;color:#18181b;">Reset your password</h1>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#52525b;">
                  We received a request to reset your REHOBOTH account password. Click the button below to choose a
                  new one. This link expires in ${expiresInMinutes} minutes.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="border-radius:8px;background-color:#FF1400;">
                      <a href="${resetLink}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#a1a1aa;word-break:break-all;">
                  Or paste this link into your browser:<br />
                  <a href="${resetLink}" style="color:#FF1400;">${resetLink}</a>
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#a1a1aa;">
                  Didn&#39;t request this? You can safely ignore this email &mdash; your password will stay the same.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
                <p style="margin:0;font-size:12px;color:#a1a1aa;">REHOBOTH Business Management System</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `Reset your password

We received a request to reset your REHOBOTH account password. Use the link below to choose a new one. This link expires in ${expiresInMinutes} minutes.

${resetLink}

Didn't request this? You can safely ignore this email — your password will stay the same.

REHOBOTH Business Management System`;

  return { subject, html, text };
}
