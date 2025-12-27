
export enum VisualStyle {
  NATURE = 'nature',
  MUSICAL = 'musical',
  CLASSIC = 'classic',
  DYNAMIC = 'dynamic'
}

export enum AnimationType {
  FADE = 'fade',
  BLUR = 'blur',
  REVEAL = 'reveal',
  BOUNCE = 'bounce',
  TYPING = 'typing',
  GLOW = 'glow'
}

export interface LyricLine {
  id: string;
  startTime: number;
  endTime: number;
  originalText: string;
  translatedText: string;
}

export interface StyleConfig {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  positionX: number;
  positionY: number;
  animationType: AnimationType;
  customFontUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  videoUrl: string | null;
  lyrics: LyricLine[];
  style: VisualStyle;
  styleConfig: StyleConfig;
  createdAt: number;
}

export type ExportStatus = 'idle' | 'rendering' | 'success' | 'emailing';

export interface AutoCaptionResponse {
  captions: {
    startTime: number;
    endTime: number;
    text: string;
    translation: string;
  }[];
}
