import { Inject, Injectable, InternalServerErrorException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import * as geoIp from 'geoip-lite';
import * as dns from 'dns';
import { promisify } from 'util';
import { UAParser } from 'ua-parser-js';
import { RISK_PROXY_SERVICE_NAME, RiskProxyServiceClient } from 'src/proto/risk';
import { lastValueFrom } from 'rxjs';
import { History } from 'src/proto/login';
import { DbGrpcKey, type ClientGrpc } from '@app/db-grpc';
import { Security } from 'src/bff-service/common/interceptors/security-context.interceptor';
import { RiskReason } from 'src/types/risk-reason';
import { Location } from 'src/bff-service/common/geo/geo.service';

@Injectable()
export class RiskService implements OnModuleInit {
  private MAX_SPEED = 100; // km/h
  private MAX_SPEED_FLY = 900; // km/h
  private reverseDns: (ip: string) => Promise<string[]>;
  private grpcService!: RiskProxyServiceClient;
  private BLACKLIST_SERVERS = [
    'zen.spamhaus.org',
    'bl.spamcop.net',
    'dnsbl.sorbs.net',
    'b.barracudacentral.org',
    'dnsbl-1.uceprotect.net',
  ];

  constructor(
    @Inject(DbGrpcKey)
    private readonly grpcClient: ClientGrpc,
  ) {
    this.reverseDns = promisify(dns.resolve4);
  }

  onModuleInit() {
    this.grpcService = this.grpcClient.getService<RiskProxyServiceClient>(RISK_PROXY_SERVICE_NAME);
  }

  public addFailure(userId: string, securityContext: Security) {
    this.grpcService.addFailure({
      id: userId,
      fingerprintHash: securityContext.fingerprint,
    });
  }

  public async calculateRisk(userId: string, history: History, securityContext: Security) {
    const { location, userAgent } = securityContext;

    let riskScore = 0;
    const reasons: RiskReason[] = [];

    if (!history) {
      this.logRiskEvent(userId, securityContext);
      reasons.push(RiskReason.NEW_DEVICE);
      riskScore += 50;
    } else {
      this.checkLoginLock(history);
      if (history.lastScore >= 80) {
        const shadowWindowDays = 7;
        const daysSinceHighRisk = (Date.now() - new Date(history.updatedAt).getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceHighRisk < shadowWindowDays) {
          reasons.push(RiskReason.PREVIOUS_HIGH_RISK);
          riskScore += 20;
        }
      }

      if (this.isNewLocation(history, location.coordinates)) {
        reasons.push(RiskReason.NEW_LOCATION);
        riskScore += 30;
      }
      if (this.isImpossibleTravel(history, location.coordinates)) {
        reasons.push(RiskReason.IMPOSSIBLE_TRAVEL);
        riskScore += 100;
      }
      if (await this.isUnusualTime(userId)) {
        if (!history || reasons.includes(RiskReason.NEW_LOCATION)) {
          reasons.push(RiskReason.UNUSUAL_TIME);
          riskScore += 25;
        } else {
          riskScore += 5;
        }
      }
      if (await this.isIpBlacklisted(securityContext.location.ip)) {
        reasons.push(RiskReason.IP_BLACKLISTED);
        riskScore += 100;
      }
      if (this.isSuspiciousUserAgent(history, userAgent)) {
        reasons.push(RiskReason.SUSPICIOUS_USER_AGENT);
        riskScore += 60;
      }
      if (this.hasMultipleFailures(history)) {
        reasons.push(RiskReason.MULTIPLE_FAILURES);
        riskScore += 60;
      }

      this.updateRiskEvent(userId, riskScore, reasons, securityContext);
    }

    return {
      score: Math.min(riskScore, 100),
      reasons,
    };
  }

  private checkLoginLock(history: History) {
    if (history.failureCount < 3 || !history.lastFailureAt) {
      return;
    }

    const duration = this.getBlockDuration(history.failureCount);
    const lockUntil = new Date(new Date(history.lastFailureAt).getTime() + duration * 60000);

    if (new Date() < lockUntil) {
      const remaining = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException({
        message: `Too many failed attempts. Try again in ${remaining} minute(s).`,
        statusCode: 429,
        error: 'Too Many Requests',
      });
    }
  }
  private logRiskEvent(userId: string, securityContext: Security) {
    this.grpcService.logRiskEvent({
      userId,
      fingerprintHash: securityContext.fingerprint,
      userAgent: securityContext.userAgent,
      city: securityContext.location.city,
      country: securityContext.location.country,
      lastIp: securityContext.location.ip,
    });
  }
  private updateRiskEvent(userId: string, score: number, reason: RiskReason[], securityContext: Security) {
    this.grpcService.updateRiskEvent({
      userId,
      fingerprintHash: securityContext.fingerprint,
      userAgent: securityContext.userAgent,
      city: securityContext.location.city,
      country: securityContext.location.country,
      lastIp: securityContext.location.ip,
      riskReasons: reason,
      lastScore: score,
    });
  }

  private isNewLocation(history: History, location: Location['coordinates']): boolean {
    const geo = geoIp.lookup(history.lastIp);
    if (geo) {
      const lastLocation = geo.ll;
      const distance = this.calculateDistance(lastLocation, location);
      return distance > 300;
    }
    return false;
  }
  private isImpossibleTravel(history: History, location: Location['coordinates']): boolean {
    const lastLoginTime = new Date(history.updatedAt).getTime();
    const currentTime = Date.now();

    const timeDifference = (currentTime - lastLoginTime) / (1000 * 60 * 60);
    const geo = geoIp.lookup(history.lastIp);

    if (geo) {
      const lastLocation = geo.ll;
      const distance = this.calculateDistance(lastLocation, location);

      if (timeDifference < 0.01 && distance > 5) {
        return true;
      }
      const requiredSpeed = distance / timeDifference;
      if (distance > 600) {
        return requiredSpeed > this.MAX_SPEED_FLY;
      }
      return requiredSpeed > this.MAX_SPEED;
    }
    return false;
  }

  private async isUnusualTime(userId: string): Promise<boolean> {
    const result = await lastValueFrom(
      this.grpcService.getUnusualTime({
        userId,
        currentHour: new Date().getHours(),
      }),
    );

    if (!result) {
      throw new InternalServerErrorException('Failed to get unusual time');
    }
    const { similarLogins, totalLogins } = result;
    if (totalLogins === 0) {
      return false;
    }

    return similarLogins === 0;
  }

  async isIpBlacklisted(ip: string): Promise<boolean> {
    if (ip.includes(':') || ip === '127.0.0.1') return false;

    const reversedIp = ip.split('.').reverse().join('.');

    try {
      const lookups = this.BLACKLIST_SERVERS.map((server) =>
        this.reverseDns(`${reversedIp}.${server}`).catch(() => null),
      );

      const results = await Promise.all(lookups);
      return results.some((res) => res !== null);
    } catch {
      return false;
    }
  }
  private isSuspiciousUserAgent(history: History, userAgent: string | undefined): boolean {
    if (!userAgent) {
      return true;
    }

    const parser = new UAParser(userAgent);
    const current = parser.getResult();

    const botPatterns = [/headless/i, /bot/i, /crawl/i, /spider/i, /python/i, /curl/i];
    const isBot = botPatterns.some((pattern) => pattern.test(userAgent));
    if (isBot) return true;

    if (history && history.userAgent) {
      const prevParser = new UAParser(history.userAgent);
      const previous = prevParser.getResult();

      if (current.os.name !== previous.os.name) {
        return true;
      }
    }

    if (current.device.model === 'iPhone' && current.browser.name !== 'Mobile Safari') {
      return true;
    }

    return false;
  }

  public getBlockDuration(failureCount: number): number {
    if (failureCount < 3) {
      return 0;
    }

    if (failureCount < 5) {
      return 1;
    }

    if (failureCount === 5) {
      return 5;
    }

    if (failureCount > 5) {
      return 5 + (failureCount - 5) * 5;
    }

    return 0;
  }

  private hasMultipleFailures(history: History): boolean {
    return history.failureCount > 3;
  }

  private calculateDistance(coords1: [number, number], coords2: [number, number]): number {
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;

    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
