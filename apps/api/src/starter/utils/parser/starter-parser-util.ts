export function FormatZip(rawVal?: any): string | null {
    if (!rawVal) return null;
    return String(rawVal).trim().replace(/\.0$/, '');
}

export function ParseFloatNullable(rawVal?: any): number | null {
    if (rawVal === undefined || rawVal === null || rawVal === '') return null;
    const parsed = parseFloat(String(rawVal));
    return isNaN(parsed) ? null : parsed;
}

export function ParseBigIntNullable(rawVal?: any): bigint | null {
    if (rawVal === undefined || rawVal === null || rawVal === '') return null;
    const numStr = String(rawVal).trim().split('.')[0];
    if (!numStr || isNaN(Number(numStr))) return null;
    try {
      return BigInt(numStr);
    } catch {
      return null;
    }
  }


  export function ParseCityState(rawVal?: string): { city: string | null; state: string | null } {
      if (!rawVal || !rawVal.trim()) return { city: null, state: null };
      const trimmed = rawVal.trim();
  
      const match = trimmed.match(/^(.*?)(?:\s+([A-Za-z]{2}))?$/);
      if (match) {
        let city = match[1]?.trim() || null;
        let state = match[2]?.trim() || null;
  
        if (city && !state && city.length === 2) {
          state = city;
          city = null;
        }
        return { city, state };
      }
      return { city: trimmed, state: null };
    }
  