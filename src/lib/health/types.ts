export type ServiceHealth =
  | { ok: true; configured: boolean }
  | { ok: false; configured: boolean; error: string };

export type ServicesHealthSnapshot = {
  inngest: ServiceHealth;
  r2: ServiceHealth;
  buffer: ServiceHealth;
  pexels: ServiceHealth;
};
