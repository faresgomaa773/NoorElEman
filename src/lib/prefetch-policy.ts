interface ConnectionInfo {
  saveData?: boolean;
  effectiveType?: string;
}

export function allowsBackgroundPrefetch(connection?: ConnectionInfo) {
  return !connection?.saveData && !["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "");
}