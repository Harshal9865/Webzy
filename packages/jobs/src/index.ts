import { logEvent, WebzyError } from '@webzy/core';

export type JobType =
  | 'publish_site'
  | 'send_email'
  | 'payment_watchdog'
  | 'expiry_reminder'
  | 'opened_alert'
  | 'cleanup_expired_drafts'
  | 'cleanup_orphaned_assets'
  | 'process_refund'
  | 'daily_reconciliation';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'dead_letter';

export interface QueuedJob<TPayload = Record<string, string | number | boolean | null>> {
  id: string;
  type: JobType;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  idempotencyKey?: string;
  payload: TPayload;
  createdAt: string;
}

export function buildJobEnvelope<TPayload>(
  id: string,
  type: JobType,
  payload: TPayload,
  options: { idempotencyKey?: string; maxAttempts?: number } = {},
): QueuedJob<TPayload> {
  if (!id.trim()) {
    throw new WebzyError('Job id is required.', {
      code: 'JOB_INVALID_ID',
      statusCode: 400,
    });
  }
  logEvent('info', 'jobs.envelope_created', { jobId: id, jobType: type });
  return {
    id,
    type,
    status: 'pending',
    attempts: 0,
    maxAttempts: options.maxAttempts ?? 5,
    idempotencyKey: options.idempotencyKey,
    payload,
    createdAt: new Date().toISOString(),
  };
}

export function describePendingJobPipelines(): {
  queuesReady: false;
  plannedJobs: JobType[];
} {
  return {
    queuesReady: false,
    plannedJobs: [
      'publish_site',
      'send_email',
      'payment_watchdog',
      'expiry_reminder',
      'opened_alert',
      'cleanup_expired_drafts',
      'cleanup_orphaned_assets',
      'process_refund',
      'daily_reconciliation',
    ],
  };
}
