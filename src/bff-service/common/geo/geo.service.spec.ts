jest.mock('geoip-lite', () => ({ lookup: jest.fn() }));
import * as geoip from 'geoip-lite';
import { GeoService } from './geo.service';

describe('GeoService', () => {
  let service: GeoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GeoService();
  });

  describe('getLocation – known public IP', () => {
    it('should return location data from geoip', () => {
      (geoip.lookup as jest.Mock).mockReturnValue({
        city: 'Warsaw',
        country: 'PL',
        ll: [52.2297, 21.0122],
        timezone: 'Europe/Warsaw',
      });

      const result = service.getLocation('1.2.3.4');

      expect(result).toEqual({
        ip: '1.2.3.4',
        city: 'Warsaw',
        country: 'PL',
        coordinates: [52.2297, 21.0122],
        timezone: 'Europe/Warsaw',
      });
    });

    it('should fall back to "Unknown" city when geoip city is empty', () => {
      (geoip.lookup as jest.Mock).mockReturnValue({
        city: '',
        country: 'US',
        ll: [37.751, -97.822],
        timezone: 'America/Chicago',
      });

      const result = service.getLocation('8.8.8.8');

      expect(result.city).toBe('Unknown');
    });

    it('should return default location when geoip returns null', () => {
      (geoip.lookup as jest.Mock).mockReturnValue(null);

      const result = service.getLocation('5.5.5.5');

      expect(result).toEqual({
        ip: '5.5.5.5',
        city: 'Unknown',
        country: 'XX',
        coordinates: [0, 0],
        timezone: 'UTC',
      });
    });
  });

  describe('getLocation – private / loopback IPs', () => {
    it('should replace loopback 127.0.0.1 with 8.8.8.8 before lookup', () => {
      (geoip.lookup as jest.Mock).mockReturnValue(null);

      service.getLocation('127.0.0.1');

      expect(geoip.lookup).toHaveBeenCalledWith('8.8.8.8');
    });

    it('should replace IPv6 loopback ::1 with 8.8.8.8', () => {
      (geoip.lookup as jest.Mock).mockReturnValue(null);

      service.getLocation('::1');

      expect(geoip.lookup).toHaveBeenCalledWith('8.8.8.8');
    });

    it('should replace 10.x.x.x private IP with 8.8.8.8', () => {
      (geoip.lookup as jest.Mock).mockReturnValue(null);

      service.getLocation('10.0.0.1');

      expect(geoip.lookup).toHaveBeenCalledWith('8.8.8.8');
    });

    it('should replace 192.168.x.x private IP with 8.8.8.8', () => {
      (geoip.lookup as jest.Mock).mockReturnValue(null);

      service.getLocation('192.168.1.1');

      expect(geoip.lookup).toHaveBeenCalledWith('8.8.8.8');
    });

    it('should replace 172.16-31.x.x private IP with 8.8.8.8', () => {
      (geoip.lookup as jest.Mock).mockReturnValue(null);

      service.getLocation('172.20.0.1');

      expect(geoip.lookup).toHaveBeenCalledWith('8.8.8.8');
    });

    it('should NOT replace 172.15.x.x (not in private range)', () => {
      (geoip.lookup as jest.Mock).mockReturnValue(null);

      service.getLocation('172.15.0.1');

      expect(geoip.lookup).toHaveBeenCalledWith('172.15.0.1');
    });
  });
});
