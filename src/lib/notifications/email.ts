import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@massymotors.co";

export async function sendAppointmentConfirmation(params: {
  to: string;
  clientName: string;
  advisorName: string;
  vehicleInterest: string;
  scheduledAt: Date;
}): Promise<void> {
  const { to, clientName, advisorName, vehicleInterest, scheduledAt } = params;

  const dateStr = scheduledAt.toLocaleDateString("es-CO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = scheduledAt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  await resend.emails.send({
    from: `Massy Motors Smart <${FROM}>`,
    to,
    subject: `✅ Cita confirmada: Test Drive ${vehicleInterest.replace(/_/g, " ")}`,
    html: emailTemplate({
      title: "Tu cita está confirmada",
      body: `
        <p>Hola ${clientName},</p>
        <p>Tu cita para el test drive del <strong>${vehicleInterest.replace(/_/g, " ")}</strong> ha sido confirmada.</p>
        <table style="margin:24px 0;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 0;color:#6B7FA3;width:120px">Fecha</td><td style="padding:8px 0;color:#fff;font-weight:600">${dateStr}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7FA3">Hora</td><td style="padding:8px 0;color:#fff;font-weight:600">${timeStr}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7FA3">Asesor</td><td style="padding:8px 0;color:#fff;font-weight:600">${advisorName}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7FA3">Dirección</td><td style="padding:8px 0;color:#fff;font-weight:600">Massy Motors Smart Cali</td></tr>
        </table>
        <p style="color:#6B7FA3">Si necesitas reprogramar, responde este correo o contáctanos por WhatsApp.</p>
      `,
    }),
  });
}

export async function sendAppointmentReminder(params: {
  to: string;
  clientName: string;
  vehicleInterest: string;
  scheduledAt: Date;
  hoursUntil: number;
}): Promise<void> {
  const { to, clientName, vehicleInterest, scheduledAt, hoursUntil } = params;

  const timeStr = scheduledAt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  await resend.emails.send({
    from: `Massy Motors Smart <${FROM}>`,
    to,
    subject: `⏰ Recordatorio: Tu test drive es en ${hoursUntil} horas`,
    html: emailTemplate({
      title: `Tu test drive es hoy a las ${timeStr}`,
      body: `
        <p>Hola ${clientName},</p>
        <p>Te recordamos que tu cita para el test drive del <strong>${vehicleInterest.replace(/_/g, " ")}</strong> es hoy a las <strong>${timeStr}</strong>.</p>
        <p>Te esperamos en <strong>Massy Motors Smart Cali</strong>.</p>
        <p style="color:#6B7FA3">¡Nos vemos pronto! 🚗⚡</p>
      `,
    }),
  });
}

export async function sendHotLeadAlert(params: {
  to: string;
  advisorName: string;
  clientName: string;
  score: number;
  vehicleInterest: string;
  channel: string;
}): Promise<void> {
  const { to, advisorName, clientName, score, vehicleInterest, channel } = params;

  await resend.emails.send({
    from: `Massy Motors Smart <${FROM}>`,
    to,
    subject: `🔥 Lead HOT: ${clientName} · Score ${score}/100`,
    html: emailTemplate({
      title: "Lead HOT detectado",
      body: `
        <p>Hola ${advisorName},</p>
        <p>El agente IA ha detectado un lead con alta intención de compra que necesita tu atención.</p>
        <table style="margin:24px 0;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 0;color:#6B7FA3;width:140px">Cliente</td><td style="padding:8px 0;color:#fff;font-weight:600">${clientName}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7FA3">Score IA</td><td style="padding:8px 0;color:#FF3B5C;font-weight:700;font-size:18px">${score}/100 🔥</td></tr>
          <tr><td style="padding:8px 0;color:#6B7FA3">Vehículo</td><td style="padding:8px 0;color:#fff;font-weight:600">${vehicleInterest.replace(/_/g, " ")}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7FA3">Canal</td><td style="padding:8px 0;color:#fff;font-weight:600">${channel}</td></tr>
        </table>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/leads" style="background:#00D4FF;color:#050B20;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Ver lead en el panel →</a></p>
      `,
    }),
  });
}

function emailTemplate({ title, body }: { title: string; body: string }): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050B20;font-family:'DM Sans',system-ui,sans-serif;color:#E8EAF0">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0D1730;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
        <tr>
          <td style="padding:24px 32px;background:#050B20;border-bottom:1px solid rgba(255,255,255,0.08)">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;height:32px;background:#00D4FF;border-radius:8px;text-align:center;vertical-align:middle">
                  <span style="color:#050B20;font-size:18px">⚡</span>
                </td>
                <td style="padding-left:10px">
                  <span style="color:#fff;font-weight:700;font-size:15px">Massy Motors Smart</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#fff">${title}</h1>
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.08)">
            <p style="margin:0;font-size:12px;color:#6B7FA3">Massy Motors Smart Cali · Este es un mensaje automático del sistema de IA</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
