export interface AppVersion {
  id: string;
  value: string;
}

export interface AppVersionValue {
  currentVersion: string;
  oldestSupportedVersion: string;
  iosUpdateLink: string;
  androidUpdateLink: string;
}
