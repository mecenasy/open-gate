export function parseConfig(configJson: string): Record<string, string> {
  try {
    return JSON.parse(configJson) as Record<string, string>;
  } catch {
    return {};
  }
}
