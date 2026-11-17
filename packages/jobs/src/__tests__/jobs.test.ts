import { describe, expect, it } from 'vitest';
import { buildJobEnvelope, describePendingJobPipelines } from '../index';

describe('@webzy/jobs Phase 0 contracts', () => {
  it('builds a typed job envelope and lists planned job pipelines', () => {
    const job = buildJobEnvelope('job_001', 'publish_site', { orderId: 'ord_123' });
    expect(job.status).toBe('pending');
    expect(job.attempts).toBe(0);
    expect(describePendingJobPipelines().plannedJobs).toContain('payment_watchdog');
  });
});
