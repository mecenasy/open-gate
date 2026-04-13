import { parseBoolean } from './parse-boolean';

describe('parseBoolean', () => {
  it('should return true for string "true"', () => {
    expect(parseBoolean('true')).toBe(true);
  });

  it('should return false for string "false"', () => {
    expect(parseBoolean('false')).toBe(false);
  });

  it('should handle uppercase "TRUE"', () => {
    expect(parseBoolean('TRUE')).toBe(true);
  });

  it('should handle uppercase "FALSE"', () => {
    expect(parseBoolean('FALSE')).toBe(false);
  });

  it('should handle mixed case "True"', () => {
    expect(parseBoolean('True')).toBe(true);
  });

  it('should handle whitespace around the value', () => {
    expect(parseBoolean('  true  ')).toBe(true);
    expect(parseBoolean('  false  ')).toBe(false);
  });

  it('should pass through actual boolean true', () => {
    expect(parseBoolean(true as unknown as string)).toBe(true);
  });

  it('should pass through actual boolean false', () => {
    expect(parseBoolean(false as unknown as string)).toBe(false);
  });

  it('should throw for an arbitrary string', () => {
    expect(() => parseBoolean('yes')).toThrow('Could not parse "yes" to bool.');
  });

  it('should throw for an empty string', () => {
    expect(() => parseBoolean('')).toThrow();
  });

  it('should throw for numeric string "1"', () => {
    expect(() => parseBoolean('1')).toThrow();
  });

  it('should throw for numeric string "0"', () => {
    expect(() => parseBoolean('0')).toThrow();
  });
});
