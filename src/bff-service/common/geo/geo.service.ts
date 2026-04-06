import { Injectable } from '@nestjs/common';
import * as geoip from 'geoip-lite';

export interface Location {
  ip: string;
  city: string;
  country: string;
  coordinates: [number, number]; // [lat, lon]
  timezone: string;
}

@Injectable()
export class GeoService {
  getLocation(ip: string): Location {
    const normalizedIp = this.isPrivateIp(ip) ? '8.8.8.8' : ip;

    const geo = geoip.lookup(normalizedIp);

    if (!geo) {
      return {
        ip: normalizedIp,
        city: 'Unknown',
        country: 'XX',
        coordinates: [0, 0],
        timezone: 'UTC',
      };
    }

    return {
      ip: normalizedIp,
      city: geo.city || 'Unknown',
      country: geo.country,
      coordinates: geo.ll,
      timezone: geo.timezone,
    };
  }

  private isPrivateIp = (ip: string) => {
    return (
      ip === '::1' ||
      ip === '127.0.0.1' ||
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31)
    );
  };
}
