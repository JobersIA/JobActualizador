export interface UpdateInfo {
  needsUpdate: boolean;
  isCompatible: boolean;
  forceUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  downloadUrl: string;
  releaseNotes: string;
}

export interface AppVersionInfo {
  versionActual: string;
  versionMinima: string;
  urlDescarga: string;
  notasVersion: string;
  actualizacionForzada: boolean;
}

export interface ApiVersionInfo {
  version: string;
  compatible_versions: string[];
  min_client_version: string;
  framework: string;
  title: string;
}
