import { createRouteLogger } from '@/lib/route-logger';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const log = createRouteLogger('feedback');

type FeedbackType = 'newsletter' | 'feedback' | 'bug';

interface FeedbackBody {
  type: FeedbackType;
  email: string;
  message?: string;
  page?: string;
}

const VALID_TYPES: FeedbackType[] = ['newsletter', 'feedback', 'bug'];

function buildHtml(body: FeedbackBody): string {
  const heading =
    body.type === 'newsletter'
      ? '📬 New Newsletter Signup'
      : body.type === 'feedback'
        ? '💬 New Feedback'
        : '🐛 Bug Report';

  return `
    <div style="font-family: monospace; padding: 20px; max-width: 500px;">
      <h2 style="margin: 0 0 16px;">${heading}</h2>
      <p><strong>Email:</strong> ${body.email}</p>
      ${body.message ? `<p><strong>Message:</strong><br/>${body.message}</p>` : ''}
      ${body.page ? `<p><strong>Page:</strong> ${body.page}</p>` : ''}
      <hr style="margin: 16px 0; border: 1px solid #333;" />
      <p style="color: #666; font-size: 12px;">Sent from your site</p>
    </div>
  `;
}

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();

  try {
    const body = (await req.json()) as FeedbackBody;
    log.info(ctx.reqId, 'Request received', { type: body.type, email: body.email });

    // Validate type
    if (!body.type || !VALID_TYPES.includes(body.type)) {
      log.warn(ctx.reqId, 'Invalid type', { type: body.type });
      return log.end(ctx, Response.json({ error: 'Invalid type' }, { status: 400 }));
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.email || !emailRegex.test(body.email)) {
      log.warn(ctx.reqId, 'Invalid email', { email: body.email });
      return log.end(ctx, Response.json({ error: 'Invalid email' }, { status: 400 }));
    }

    // Check env vars
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const feedbackTo = process.env.FEEDBACK_TO || gmailUser;

    if (!gmailUser || !gmailPass) {
      log.warn(ctx.reqId, 'Gmail credentials not configured');
      return log.end(ctx, Response.json({ error: 'Email service unavailable' }, { status: 503 }));
    }

    // Send notification email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    const subjectMap: Record<FeedbackType, string> = {
      newsletter: `📬 New signup: ${body.email}`,
      feedback: `💬 Feedback from ${body.email}`,
      bug: `🐛 Bug report from ${body.email}`,
    };

    await transporter.sendMail({
      from: gmailUser,
      to: feedbackTo,
      subject: subjectMap[body.type],
      html: buildHtml(body),
    });

    log.info(ctx.reqId, 'Email sent', { to: feedbackTo });

    // Add to Resend Contacts for newsletter signups (best-effort — never blocks the response)
    // Contacts are global in Resend v2+ — no audience ID needed
    if (body.type === 'newsletter') {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        try {
          const resend = new Resend(resendKey);
          await resend.contacts.create({ email: body.email, unsubscribed: false });
          log.info(ctx.reqId, 'Resend contact created');
        } catch (resendError) {
          // Non-fatal — inbox notification already sent, list add failed silently
          log.warn(ctx.reqId, 'Resend contact creation failed', { error: resendError });
        }
      } else {
        log.warn(ctx.reqId, 'Resend not configured — signup not saved to contacts');
      }
    }

    return log.end(ctx, Response.json({ ok: true }));
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
