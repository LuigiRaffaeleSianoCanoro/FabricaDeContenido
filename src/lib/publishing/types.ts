export type PublishingAccountRef = {
  /** Buffer social profile id or similar */
  profileId: string;
};

export type SchedulePostParams = {
  text: string;
  mediaUrls?: string[];
  scheduledAt: Date;
  profileIds: string[];
};

export type PublishNowParams = Omit<SchedulePostParams, "scheduledAt">;

export type PublishedUpdate = {
  id: string;
  provider: "buffer";
  raw: unknown;
};

export interface PublishingProvider {
  readonly providerId: "buffer";
  schedulePost(params: SchedulePostParams, accessToken: string): Promise<PublishedUpdate>;
  publishPost(params: PublishNowParams, accessToken: string): Promise<PublishedUpdate>;
}
