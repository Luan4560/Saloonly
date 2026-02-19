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
