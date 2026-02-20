import nodemailer from "nodemailer";
import { env } from "@/env";

function getTransporter() {
  if (!env.SMTP_USER || !env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string,
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const address = env.SMTP_USER ?? env.MAIL_FROM;
  const from = { name: "Saloonly", address };
  await transporter.sendMail({
    from,
    to,
    subject: "Redefinição de senha - Saloonly",
    text: `Use o link abaixo para redefinir sua senha:\n\n${resetLink}\n\nO link expira em 1 hora.`,
    html: `<p>Use o link abaixo para redefinir sua senha:</p><p><a href="${resetLink}">Redefinir senha</a></p><p>O link expira em 1 hora.</p>`,
  });
}

export type AppointmentConfirmationPayload = {
  toEmail: string;
  userName: string | null;
  establishmentName: string;
  collaboratorName: string;
  slots: { date: string; open_time: string; close_time: string }[];
  serviceNames: string;
};

export async function sendAppointmentConfirmationEmail(
  payload: AppointmentConfirmationPayload,
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const slotsList = payload.slots
    .map(
      (s) =>
        `  • ${s.date} das ${s.open_time} às ${s.close_time}`,
    )
    .join("\n");
  const from = { name: "Saloonly", address: env.SMTP_USER ?? env.MAIL_FROM };
  const subject = "Agendamento confirmado - Saloonly";
  const text = `Olá${payload.userName ? ` ${payload.userName}` : ""},\n\nSeu agendamento foi confirmado.\n\nNegócio: ${payload.establishmentName}\nColaborador(a): ${payload.collaboratorName}\nServiço(s): ${payload.serviceNames}\n\nHorários:\n${slotsList}\n\nQualquer alteração, entre em contato com o negócio.`;
  const html = `<p>Olá${payload.userName ? ` ${payload.userName}` : ""},</p><p>Seu agendamento foi confirmado.</p><p><strong>Negócio:</strong> ${payload.establishmentName}<br><strong>Colaborador(a):</strong> ${payload.collaboratorName}<br><strong>Serviço(s):</strong> ${payload.serviceNames}</p><p><strong>Horários:</strong></p><ul>${payload.slots.map((s) => `<li>${s.date} das ${s.open_time} às ${s.close_time}</li>`).join("")}</ul><p>Qualquer alteração, entre em contato com o negócio.</p>`;

  await transporter.sendMail({
    from,
    to: payload.toEmail,
    subject,
    text,
    html,
  });
}

/** Use this to verify SMTP config (e.g. in dev). Call: require("@/lib/nodemailer").verifyTransporter() */
export async function verifyTransporter(): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP not configured (SMTP_USER/SMTP_PASS missing).");
    return false;
  }
  try {
    await transporter.verify();
    console.log("SMTP connection verified.");
    return true;
  } catch (err) {
    console.error("SMTP verify failed:", err);
    return false;
  }
}
