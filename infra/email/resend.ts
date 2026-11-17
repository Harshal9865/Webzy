import { getWebzyPublicConfig, logEvent } from '@webzy/core';

export interface TransactionalEmailInput {
  to: string;
  subject: string;
  text: string;
  idempotencyKey: string;
}

export interface TransactionalEmailResult {
  sent: boolean;
  mode: 'resend' | 'local_log';
  messageId?: string;
}

/**
 * Transactional email helper (Section 10 & Section 21):
 * Automatically prepends `[TEST] ` to subjects when Mock payments are active.
 * Falls back to structured PII-safe logging locally when RESEND_API_KEY is unset.
 */
export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
): Promise<TransactionalEmailResult> {
  const config = getWebzyPublicConfig();
  const subject = config.isMockPaymentMode ? `[TEST] ${input.subject}` : input.subject;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || 'hello@webzy.in';

  if (!apiKey) {
    logEvent('info', 'email.local_outbox_recorded', {
      idempotencyKey: input.idempotencyKey,
      isTestMode: config.isMockPaymentMode,
      subjectPreview: subject.slice(0, 60),
    });
    return {
      sent: true,
      mode: 'local_log',
      messageId: `local_${input.idempotencyKey}`,
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': input.idempotencyKey,
      },
      body: JSON.stringify({
        from: `${config.business.name} <${fromEmail}>`,
        to: [input.to],
        subject,
        text: input.text,
      }),
    });

    if (!res.ok) {
      logEvent('warn', 'email.resend_http_error', {
        statusCode: res.status,
        idempotencyKey: input.idempotencyKey,
      });
      return { sent: false, mode: 'resend' };
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    logEvent('info', 'email.resend_sent', {
      messageId: data.id || '',
      idempotencyKey: input.idempotencyKey,
    });
    return { sent: true, mode: 'resend', messageId: data.id };
  } catch (err) {
    logEvent('error', 'email.resend_exception', {
      idempotencyKey: input.idempotencyKey,
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return { sent: false, mode: 'resend' };
  }
}
