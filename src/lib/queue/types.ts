export type QueueJobPayload = Record<string, unknown>;

export type EnqueueOptions = {
  idempotencyKey?: string;
};

export type EnqueueResult = {
  id: string;
};

/**
 * Abstraction for background execution. Default implementation is Inngest; a BullMQ
 * adapter can implement the same interface for self-hosted deployments.
 */
export interface JobQueue {
  emit(eventName: string, data: QueueJobPayload, options?: EnqueueOptions): Promise<EnqueueResult>;
}
