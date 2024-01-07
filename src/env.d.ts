/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly IS_MAINTENANCE_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
