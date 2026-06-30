export function wrapEmailLayout(title: string, innerHtml: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="background-color: #fbfaf6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px; color: #1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e6ded0; box-shadow: 0 12px 40px rgba(60,45,26,0.06); overflow: hidden;">
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px auto;">
          <tr>
            <td style="width: 50px; height: 50px; background-color: #1a1a1a; color: #ffffff; border-radius: 16px; font-size: 26px; font-weight: 900; text-align: center; vertical-align: middle;">R</td>
          </tr>
        </table>
        ${innerHtml}
        <p style="margin: 32px 0 0 0; font-size: 13px; color: #9a9286; line-height: 1.5;">
          Have questions? Just reply to this email.<br>
          <span style="display: inline-block; margin-top: 8px;">&copy; Ask Ralph</span>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
}
