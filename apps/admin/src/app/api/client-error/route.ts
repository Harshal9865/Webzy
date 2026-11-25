import { NextResponse, type NextRequest } from 'next/server';
import { guardMutationRequest } from '../../../../../../infra/security/requestGuard';
import { reportServerError } from '../../../../../../infra/sentry/monitor';

export async function POST(request: NextRequest) {
  const guard = await guardMutationRequest(request, {
    bucket: 'client_error_admin',
    maxHits: 20,
    windowSeconds: 60,
  });
  if (guard) return guard;

  const body = (await request.json().catch(() => null)) as {
    message?: unknown;
    name?: unknown;
    digest?: unknown;
    route?: unknown;
  } | null;

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid error report payload.' }, { status: 400 });
  }

  const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';
  if (!rawMessage) {
    return NextResponse.json({ error: 'Missing error message.' }, { status: 400 });
  }

  const message = rawMessage.slice(0, 240);
  const name =
    typeof body.name === 'string' && body.name.trim()
      ? body.name.trim().slice(0, 64)
      : 'ClientError';
  const digest =
    typeof body.digest === 'string' && body.digest.trim()
      ? body.digest.trim().slice(0, 64)
      : undefined;
  const route =
    typeof body.route === 'string' && body.route.trim()
      ? body.route.trim().slice(0, 120)
      : '/';

  const clientError = new Error(message);
  clientError.name = name;
  clientError.stack = `${name}: ${message}`;

  reportServerError(clientError, {
    app: 'admin',
    source: 'client_error_boundary',
    route,
    ...(digest ? { digest } : {}),
  });

  return NextResponse.json({ ok: true }, { status: 202 });
}
