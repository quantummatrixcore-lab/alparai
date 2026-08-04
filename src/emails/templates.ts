/**
 * Premium email HTML templates for ALPAR AI notifications.
 */

interface ConfirmationParams {
  title: string;
  category: string;
  severity: string;
  date: string;
  locale: "en" | "tr";
}

export function getWhistleblowerConfirmationEmail({
  title,
  category,
  severity,
  date,
  locale,
}: ConfirmationParams): string {
  const isTr = locale === "tr";

  const subject = isTr ? "Olay Raporunuz Alındı — ALPAR AI" : "Incident Report Received — ALPAR AI";

  const greeting = isTr ? "Merhaba Whistleblower," : "Hello Whistleblower,";

  const bodyText = isTr
    ? "AI hesap verebilirliğini desteklediğiniz için teşekkür ederiz. Bildirdiğiniz olay başarıyla kuyruğa alındı ve moderasyon ekibimiz ile Cross-Audit yapay zeka denetleyicilerimiz tarafından incelenmektedir."
    : "Thank you for contributing to AI accountability. The incident you reported has been successfully queued and is currently being reviewed by our moderation team and Cross-Audit AI auditors.";

  const detailsTitle = isTr ? "Rapor Detayları" : "Report Details";
  const labelCategory = isTr ? "Kategori" : "Category";
  const labelSeverity = isTr ? "Önem Derecesi" : "Severity";
  const labelDate = isTr ? "Olay Tarihi" : "Incident Date";

  const statusTitle = isTr ? "Süreç Durumu" : "Audit Status";
  const statusBody = isTr
    ? "Raporunuz doğrulandıktan sonra platformda yayınlanacak ve ilgili yapay zeka sağlayıcısına (AI Provider) resmi yanıt hakkı tanınması için bildirim gönderilecektir."
    : "Once verified, your report will be published, and the AI provider will be notified to issue an official response.";

  const footerText = isTr
    ? "Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız."
    : "This is an automated email. Please do not reply directly to this message.";

  const severityColor =
    severity === "critical"
      ? "#ef4444"
      : severity === "high"
        ? "#f97316"
        : severity === "medium"
          ? "#eab308"
          : "#3b82f6";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body {
            background-color: #09090b;
            color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #18181b;
            border: 1px solid #27272a;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
          }
          .header {
            background: linear-gradient(135deg, #0891b2, #0284c7);
            padding: 30px 40px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 0.05em;
            color: #ffffff;
            text-transform: uppercase;
          }
          .content {
            padding: 40px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 16px;
          }
          .body-text {
            font-size: 15px;
            line-height: 1.6;
            color: #a1a1aa;
            margin-bottom: 32px;
          }
          .card {
            background-color: #09090b;
            border: 1px solid #27272a;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
          }
          .card h2 {
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: 800;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #27272a;
            padding-bottom: 8px;
          }
          .incident-title {
            font-size: 16px;
            font-weight: 700;
            color: #22d3ee;
            margin-bottom: 16px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .detail-label {
            color: #71717a;
            font-weight: 600;
          }
          .detail-value {
            color: #e4e4e7;
            font-weight: 700;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .footer {
            background-color: #09090b;
            padding: 20px 40px;
            border-top: 1px solid #27272a;
            text-align: center;
            font-size: 12px;
            color: #52525b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ALPAR AI</h1>
          </div>
          <div class="content">
            <div class="greeting">${greeting}</div>
            <div class="body-text">${bodyText}</div>
            
            <div class="card">
              <h2>${detailsTitle}</h2>
              <div class="incident-title">${title}</div>
              
              <div class="detail-row">
                <span class="detail-label">${labelCategory}:</span>
                <span class="detail-value">${category}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${labelSeverity}:</span>
                <span class="detail-value" style="color: ${severityColor}; text-transform: uppercase;">
                  ${severity}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${labelDate}:</span>
                <span class="detail-value">${date}</span>
              </div>
            </div>

            <div class="card" style="border-left: 4px solid #22d3ee;">
              <h2 style="color: #22d3ee; border-bottom: none; padding-bottom: 0;">${statusTitle}</h2>
              <p style="margin: 8px 0 0 0; font-size: 14px; line-height: 1.5; color: #a1a1aa;">
                ${statusBody}
              </p>
            </div>
          </div>
          <div class="footer">
            <p>${footerText}</p>
            <p style="margin-top: 4px; font-weight: bold; color: #71717a;">ALPAR AI — Trust Infrastructure for AI Accountability</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

interface AdminParams {
  id: string;
  title: string;
  category: string;
  severity: string;
}

export function getAdminNotificationEmail({ id, title, category, severity }: AdminParams): string {
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com"}/admin/incidents`; // or /admin depending on route
  const severityColor =
    severity === "critical"
      ? "#ef4444"
      : severity === "high"
        ? "#f97316"
        : severity === "medium"
          ? "#eab308"
          : "#3b82f6";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Incident Reported: Pending Review</title>
        <style>
          body {
            background-color: #09090b;
            color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #18181b;
            border: 1px solid #ef4444;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
          }
          .header {
            background-color: #ef4444;
            padding: 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 900;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .content {
            padding: 40px;
          }
          .card {
            background-color: #09090b;
            border: 1px solid #27272a;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
          }
          .card-title {
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 16px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .detail-label {
            color: #71717a;
            font-weight: 600;
          }
          .detail-value {
            color: #e4e4e7;
            font-weight: 700;
          }
          .btn-container {
            text-align: center;
            margin-top: 32px;
          }
          .btn {
            background-color: #ef4444;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 700;
            text-decoration: none;
            display: inline-block;
          }
          .btn:hover {
            background-color: #dc2626;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ALERT: NEW INCIDENT SUBMITTED</h1>
          </div>
          <div class="content">
            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6;">
              A new AI incident has been submitted by a whistleblower and requires immediate moderation and Cross-Audit confirmation.
            </p>
            
            <div class="card">
              <div class="card-title">${title}</div>
              
              <div class="detail-row">
                <span class="detail-label">Incident ID:</span>
                <span class="detail-value" style="font-family: monospace;">${id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${category}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Severity:</span>
                <span class="detail-value" style="color: ${severityColor}; text-transform: uppercase;">
                  ${severity}
                </span>
              </div>
            </div>

            <div class="btn-container">
              <a href="${adminUrl}" class="btn">Open Moderation Panel</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

interface ProviderAlertParams {
  providerName: string;
  incidentId: string;
  title: string;
  category: string;
  severity: string;
  token: string;
  locale: "en" | "tr";
}

export function getProviderAlertEmail({
  providerName,
  incidentId,
  title,
  category,
  severity,
  token,
  locale,
}: ProviderAlertParams): string {
  const isTr = locale === "tr";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com";
  const actionUrl = `${appUrl}/incidents/${incidentId}/respond?token=${token}`;

  const subject = isTr
    ? `[ALPAR AI] Yapay Zekanız İçin Yeni Olay Raporu: ${title.substring(0, 30)}...`
    : `[ALPAR AI] New Incident Report for Your AI: ${title.substring(0, 30)}...`;

  const greeting = isTr ? `Sayın ${providerName} Yetkilisi,` : `Dear ${providerName} Team,`;

  const bodyText = isTr
    ? "ALPAR AI şeffaflık platformunda, geliştirdiğiniz veya sunduğunuz yapay zeka sistemi hakkında yeni bir olay bildirimi doğrulanmıştır. Profiliniz doğrulanmış bir sağlayıcı olduğu için Madde 73 taksonomisine uygun olarak resmi yanıt hakkınız bulunmaktadır."
    : "A new incident involving your AI system has been verified on the ALPAR AI transparency platform. As a verified provider, you have the official right of reply under the Article 73 taxonomy.";

  const detailsTitle = isTr ? "Olay Detayları" : "Incident Details";
  const labelCategory = isTr ? "Kategori" : "Category";
  const labelSeverity = isTr ? "Önem Derecesi" : "Severity";

  const ctaText = isTr ? "Resmi Yanıt Yayınla" : "Publish Official Response";
  const ctaDesc = isTr
    ? "Aşağıdaki butonla şifresiz ve hızlı bir şekilde resmi counter-statement (karşı açıklama) yayınlayabilirsiniz. Bu açıklama olay sayfasında en üstte iğnelenecektir."
    : "Click below to publish an official counter-statement. Your response will be pinned at the top of the incident page.";

  const footerText = isTr
    ? "Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız."
    : "This is an automated email. Please do not reply directly to this message.";

  const severityColor =
    severity === "critical"
      ? "#ef4444"
      : severity === "high"
        ? "#f97316"
        : severity === "medium"
          ? "#eab308"
          : "#3b82f6";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body {
            background-color: #09090b;
            color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #18181b;
            border: 1px solid #00ff88;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
          }
          .header {
            background: linear-gradient(135deg, #00ff88, #059669);
            padding: 30px 40px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 0.05em;
            color: #09090b;
            text-transform: uppercase;
          }
          .content {
            padding: 40px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 16px;
          }
          .body-text {
            font-size: 15px;
            line-height: 1.6;
            color: #a1a1aa;
            margin-bottom: 32px;
          }
          .card {
            background-color: #09090b;
            border: 1px solid #27272a;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
          }
          .card h2 {
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: 800;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #27272a;
            padding-bottom: 8px;
          }
          .incident-title {
            font-size: 16px;
            font-weight: 700;
            color: #00ff88;
            margin-bottom: 16px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .detail-label {
            color: #71717a;
            font-weight: 600;
          }
          .detail-value {
            color: #e4e4e7;
            font-weight: 700;
          }
          .btn-container {
            text-align: center;
            margin: 32px 0;
          }
          .btn {
            background-color: #00ff88;
            color: #09090b;
            padding: 12px 28px;
            border-radius: 8px;
            font-weight: 800;
            text-decoration: none;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .btn:hover {
            background-color: #34d399;
          }
          .footer {
            background-color: #09090b;
            padding: 20px 40px;
            border-top: 1px solid #27272a;
            text-align: center;
            font-size: 12px;
            color: #52525b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ALPAR AI PROVIDER ALERT</h1>
          </div>
          <div class="content">
            <div class="greeting">${greeting}</div>
            <div class="body-text">${bodyText}</div>
            
            <div class="card">
              <h2>${detailsTitle}</h2>
              <div class="incident-title">${title}</div>
              
              <div class="detail-row">
                <span class="detail-label">${labelCategory}:</span>
                <span class="detail-value">${category}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${labelSeverity}:</span>
                <span class="detail-value" style="color: ${severityColor}; text-transform: uppercase;">
                  ${severity}
                </span>
              </div>
            </div>

            <p style="font-size: 14px; color: #a1a1aa; line-height: 1.5; margin-bottom: 8px;">
              ${ctaDesc}
            </p>
            <div class="btn-container">
              <a href="${actionUrl}" class="btn">${ctaText}</a>
            </div>
          </div>
          <div class="footer">
            <p>${footerText}</p>
            <p style="margin-top: 4px; font-weight: bold; color: #71717a;">ALPAR AI — Trust Infrastructure for AI Accountability</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export interface ProviderResponseNotificationParams {
  title: string;
  providerName: string;
  actionUrl: string;
  locale: string;
  unsubscribeUrl: string;
}

export function getProviderResponseNotificationEmail({
  title,
  providerName,
  actionUrl,
  locale,
  unsubscribeUrl,
}: ProviderResponseNotificationParams): string {
  const isTr = locale === "tr";
  const subject = isTr
    ? `[ALPAR AI] Resmi Yanıt Alındı: ${providerName}`
    : `[ALPAR AI] Official Response Received: ${providerName}`;
  const greeting = isTr ? "Merhaba Muhabir," : "Hello Reporter,";
  const bodyText = isTr
    ? `Bildirdiğiniz olayla ilgili ${providerName} firmasından resmi bir açıklama geldi. Yanıtı hemen inceleyebilirsiniz.`
    : `An official response has been received from ${providerName} regarding the incident you reported. You can review their statement now.`;
  const detailsTitle = isTr ? "Olay Başlığı" : "Incident Title";
  const ctaText = isTr ? "Yanıtı Görüntüle" : "View Statement";
  const footerText = isTr
    ? "Bu e-posta otomatik olarak gönderilmiştir. Bildirim ayarlarınızı değiştirmek için:"
    : "This is an automated email. To manage your notification preferences:";
  const unsubText = isTr ? "Abonelikten Çık" : "Unsubscribe";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body {
            background-color: #09090b;
            color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #18181b;
            border: 1px solid #27272a;
            border-radius: 16px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #00ff88, #0A1622);
            padding: 30px 40px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 800;
          }
          .content {
            padding: 40px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #ffffff;
          }
          .body-text {
            font-size: 15px;
            line-height: 1.6;
            color: #d4d4d8;
            margin-bottom: 24px;
          }
          .card {
            background-color: #09090b;
            border: 1px solid #27272a;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .card h2 {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #a1a1aa;
            margin: 0 0 8px 0;
          }
          .incident-title {
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            line-height: 1.4;
          }
          .btn-container {
            text-align: center;
            margin-top: 24px;
          }
          .btn {
            display: inline-block;
            background-color: #00ff88;
            color: #0A1622;
            font-weight: 700;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 15px;
            transition: background-color 0.2s;
          }
          .footer {
            background-color: #18181b;
            border-top: 1px solid #27272a;
            padding: 20px 40px;
            text-align: center;
            font-size: 12px;
            color: #71717a;
          }
          .footer a {
            color: #00ff88;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ALPAR AI</h1>
          </div>
          <div class="content">
            <div class="greeting">${greeting}</div>
            <p class="body-text">${bodyText}</p>
            <div class="card">
              <h2>${detailsTitle}</h2>
              <div class="incident-title">${title}</div>
            </div>
            <div class="btn-container">
              <a href="${actionUrl}" class="btn">${ctaText}</a>
            </div>
          </div>
          <div class="footer">
            <p>${footerText} <a href="${unsubscribeUrl}">${unsubText}</a></p>
            <p style="margin-top: 4px; font-weight: bold; color: #71717a;">ALPAR AI — Trust Infrastructure for AI Accountability</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export interface ExpertVerificationParams {
  title: string;
  expertName: string;
  actionUrl: string;
  locale: string;
  unsubscribeUrl: string;
}

export function getExpertVerificationEmail({
  title,
  expertName,
  actionUrl,
  locale,
  unsubscribeUrl,
}: ExpertVerificationParams): string {
  const isTr = locale === "tr";
  const subject = isTr
    ? "[ALPAR AI] Uzman Doğrulaması Başarılı"
    : "[ALPAR AI] Expert Verification Successful";
  const greeting = isTr ? "Merhaba Muhabir," : "Hello Reporter,";
  const bodyText = isTr
    ? `Rapor ettiğiniz olay bir alan uzmanı (${expertName}) tarafından doğrulanmıştır.`
    : `The incident you reported has been officially verified by domain expert (${expertName}).`;
  const detailsTitle = isTr ? "Olay Başlığı" : "Incident Title";
  const ctaText = isTr ? "Raporu İncele" : "View Incident";
  const footerText = isTr
    ? "Bu e-posta otomatik olarak gönderilmiştir. Bildirim ayarlarınızı değiştirmek için:"
    : "This is an automated email. To manage your notification preferences:";
  const unsubText = isTr ? "Abonelikten Çık" : "Unsubscribe";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body {
            background-color: #09090b;
            color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #18181b;
            border: 1px solid #27272a;
            border-radius: 16px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #00ff88, #0A1622);
            padding: 30px 40px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 800;
          }
          .content {
            padding: 40px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #ffffff;
          }
          .body-text {
            font-size: 15px;
            line-height: 1.6;
            color: #d4d4d8;
            margin-bottom: 24px;
          }
          .card {
            background-color: #09090b;
            border: 1px solid #27272a;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .card h2 {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #a1a1aa;
            margin: 0 0 8px 0;
          }
          .incident-title {
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            line-height: 1.4;
          }
          .btn-container {
            text-align: center;
            margin-top: 24px;
          }
          .btn {
            display: inline-block;
            background-color: #00ff88;
            color: #0A1622;
            font-weight: 700;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 15px;
            transition: background-color 0.2s;
          }
          .footer {
            background-color: #18181b;
            border-top: 1px solid #27272a;
            padding: 20px 40px;
            text-align: center;
            font-size: 12px;
            color: #71717a;
          }
          .footer a {
            color: #00ff88;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ALPAR AI</h1>
          </div>
          <div class="content">
            <div class="greeting">${greeting}</div>
            <p class="body-text">${bodyText}</p>
            <div class="card">
              <h2>${detailsTitle}</h2>
              <div class="incident-title">${title}</div>
            </div>
            <div class="btn-container">
              <a href="${actionUrl}" class="btn">${ctaText}</a>
            </div>
          </div>
          <div class="footer">
            <p>${footerText} <a href="${unsubscribeUrl}">${unsubText}</a></p>
            <p style="margin-top: 4px; font-weight: bold; color: #71717a;">ALPAR AI — Trust Infrastructure for AI Accountability</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export interface AdvisoryBoardInvitationParams {
  recipientName: string;
  inviteLink: string;
  locale: "en" | "tr";
  unsubscribeUrl?: string;
}

export function getAdvisoryBoardInvitationEmail({
  recipientName,
  inviteLink,
  locale,
  unsubscribeUrl = "https://alparai.com/unsubscribe",
}: AdvisoryBoardInvitationParams): string {
  const isTr = locale === "tr";
  const subject = isTr
    ? "[ALPAR AI] Danışma Kurulu Katılım Daveti"
    : "[ALPAR AI] Advisory Board Invitation";
  const greeting = isTr ? `Sayın ${recipientName},` : `Dear ${recipientName},`;
  const bodyText = isTr
    ? "Yapay zeka sistemlerinin hesap verebilirliğini, şeffaflığını ve güvenliğini artırma misyonumuza katkı sağlamak üzere sizi ALPAR AI Danışma Kurulu'na (Advisory Board) davet etmekten onur duyarız. Alanınızdaki birikiminizin, bağımsız denetim metodolojilerimizi şekillendirmede son derece değerli olacağına inanıyoruz."
    : "We are honored to invite you to join the ALPAR AI Advisory Board to contribute to our mission of advancing accountability, transparency, and safety in AI systems. We believe your expertise will be invaluable in shaping our independent auditing methodologies.";
  const ctaText = isTr ? "Daveti Kabul Et & Başvur" : "Accept Invitation & Apply";
  const detailsTitle = isTr ? "ALPAR AI Hakkında" : "About ALPAR AI";
  const detailsBody = isTr
    ? "ALPAR AI, yapay zeka hatalarının bağımsız olarak raporlandığı ve tarafsız Cross-Audit mekanizmalarıyla değerlendirildiği küresel bir güven altyapısıdır. Danışma Kurulu üyelerimiz, denetim standartlarımızın akademik ve sektörel bağımsızlığını korumasını güvence altına alır."
    : "ALPAR AI is a global trust infrastructure where AI incidents are independently reported and audited using neutral Cross-Audit mechanisms. Our Advisory Board members ensure that our auditing standards remain academically and industrially independent.";
  const footerText = isTr
    ? "Bu e-posta daveti şahsınıza özel gönderilmiştir. Bildirim ayarlarını yönetmek için:"
    : "This email invitation is intended solely for the recipient. To manage notifications:";
  const unsubText = isTr ? "Abonelikten Çık" : "Unsubscribe";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body {
            background-color: #09090b;
            color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #18181b;
            border: 1px solid #27272a;
            border-radius: 16px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #00ff88, #0A1622);
            padding: 30px 40px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 800;
          }
          .content {
            padding: 40px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #ffffff;
          }
          .body-text {
            font-size: 15px;
            line-height: 1.6;
            color: #d4d4d8;
            margin-bottom: 24px;
          }
          .card {
            background-color: #09090b;
            border: 1px solid #27272a;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .card h2 {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #a1a1aa;
            margin: 0 0 8px 0;
          }
          .details-text {
            font-size: 14px;
            color: #a1a1aa;
            line-height: 1.5;
          }
          .btn-container {
            text-align: center;
            margin-top: 24px;
          }
          .btn {
            display: inline-block;
            background-color: #00ff88;
            color: #0A1622;
            font-weight: 700;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 15px;
            transition: background-color 0.2s;
          }
          .footer {
            background-color: #18181b;
            border-top: 1px solid #27272a;
            padding: 20px 40px;
            text-align: center;
            font-size: 12px;
            color: #71717a;
          }
          .footer a {
            color: #00ff88;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ALPAR AI</h1>
          </div>
          <div class="content">
            <div class="greeting">${greeting}</div>
            <p class="body-text">${bodyText}</p>
            <div class="card">
              <h2>${detailsTitle}</h2>
              <div class="details-text">${detailsBody}</div>
            </div>
            <div class="btn-container">
              <a href="${inviteLink}" class="btn">${ctaText}</a>
            </div>
          </div>
          <div class="footer">
            <p>${footerText} <a href="${unsubscribeUrl}">${unsubText}</a></p>
            <p style="margin-top: 4px; font-weight: bold; color: #71717a;">ALPAR AI — Trust Infrastructure for AI Accountability</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
