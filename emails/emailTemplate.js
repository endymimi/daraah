export function resetPasswordEmailTemplate(firstName, resetUrl) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f2ed; font-family: 'Arial', sans-serif; color:#2f2f2f;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 0;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#e8e2d8; padding:30px;">
              <img 
                src="https://res.cloudinary.com/ds0a0s3k3/image/upload/v1767445179/daraahicon_jyhkvu.png"
                alt="Daraah Limited"
                style="max-width:60px; display:block; margin-bottom:15px;"
              />
              <h1 style="margin:0; font-size:26px; letter-spacing:1px; color:#3b3b3b;">
                Daraah Limited
              </h1>
              <p style="margin:8px 0 0; font-size:14px; color:#6b6b6b;">
                Story Woven Into Styles
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px;">
              <p style="font-size:18px; margin-top:0;">
                Hello <strong>${firstName}</strong>,
              </p>

              <p style="font-size:16px; line-height:1.7;">
                We received a request to reset your password for your Daraah Limited account.
                If you made this request, simply click the button below.
              </p>

              <!-- Button -->
              <div style="text-align:center; margin:35px 0;">
                <a 
                  href="${resetUrl}" 
                  style="
                    background-color:#8b6f47;
                    color:#ffffff;
                    text-decoration:none;
                    padding:14px 34px;
                    border-radius:30px;
                    font-size:16px;
                    font-weight:bold;
                    display:inline-block;
                    letter-spacing:0.5px;
                  "
                  clicktracking="off"
                >
                  Reset Password
                </a>
              </div>

              <p style="font-size:14px; color:#6b6b6b; line-height:1.6;">
                This password reset link will expire soon for security reasons.
                If you didn’t request a password reset, you can safely ignore this email.
              </p>

              <hr style="border:none; border-top:1px solid #eee; margin:30px 0;" />

              <p style="font-size:14px; color:#6b6b6b;">
                With warmth,<br />
                <strong>The Daraah Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#f1ede6; padding:20px;">
              <p style="font-size:12px; color:#8a8a8a; margin:0;">
                © ${new Date().getFullYear()} Daraah Limited. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}
