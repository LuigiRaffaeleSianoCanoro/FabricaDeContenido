export type TTSParams = {
  text: string;
  voice?: string;
  rate?: string;
  volume?: string;
};

export type TTSResult = {
  audio: Buffer;
  mimeType: string;
  subtitle: unknown;
};

export interface TTSProvider {
  readonly providerId: string;
  generateVoice(params: TTSParams): Promise<TTSResult>;
}
