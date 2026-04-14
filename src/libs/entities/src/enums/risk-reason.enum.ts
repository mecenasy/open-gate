export enum RiskReason {
  NEW_DEVICE = 'NEW_DEVICE',
  NEW_LOCATION = 'NEW_LOCATION',
  IMPOSSIBLE_TRAVEL = 'IMPOSSIBLE_TRAVEL',
  UNUSUAL_TIME = 'UNUSUAL_TIME',
  IP_BLACKLISTED = 'IP_BLACKLISTED',
  SUSPICIOUS_USER_AGENT = 'SUSPICIOUS_UA',
  MULTIPLE_FAILURES = 'MULTIPLE_FAILURES',
  PREVIOUS_HIGH_RISK = 'PREVIOUS_HIGH_RISK',
}

export enum RiskWeight {
  LOW = 10,
  MEDIUM = 30,
  HIGH = 60,
  CRITICAL = 100,
}

export const RiskScoreMapping: Record<RiskReason, RiskWeight> = {
  [RiskReason.NEW_DEVICE]: RiskWeight.MEDIUM,
  [RiskReason.NEW_LOCATION]: RiskWeight.MEDIUM,
  [RiskReason.IMPOSSIBLE_TRAVEL]: RiskWeight.CRITICAL,
  [RiskReason.UNUSUAL_TIME]: RiskWeight.LOW,
  [RiskReason.IP_BLACKLISTED]: RiskWeight.CRITICAL,
  [RiskReason.SUSPICIOUS_USER_AGENT]: RiskWeight.HIGH,
  [RiskReason.MULTIPLE_FAILURES]: RiskWeight.HIGH,
  [RiskReason.PREVIOUS_HIGH_RISK]: RiskWeight.HIGH,
};
