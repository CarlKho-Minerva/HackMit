/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly VITE_RUNPOD_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
