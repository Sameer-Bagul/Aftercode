export function normalizeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function deduplicateArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function stripEmojis(str: string): string {
  if (!str) return str;
  return str
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeObjectEmojis(obj: any): any {
  if (typeof obj === 'string') {
    return stripEmojis(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObjectEmojis(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      res[key] = sanitizeObjectEmojis(obj[key]);
    }
    return res;
  }
  return obj;
}
