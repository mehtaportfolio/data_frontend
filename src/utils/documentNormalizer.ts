export function normalizeDocumentArray(data: string | string[] | null | undefined): string[] {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data.filter(item => typeof item === 'string' && item.length > 0);
  }
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string' && item.length > 0);
      }
      return [data];
    } catch {
      return data.length > 0 ? [data] : [];
    }
  }
  
  return [];
}

export function ensureDocumentArray(data: unknown): string[] {
  if (Array.isArray(data)) {
    return data.filter(item => typeof item === 'string');
  }
  
  if (typeof data === 'string' && data.length > 0) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string');
      }
    } catch {
      return [data];
    }
  }
  
  return [];
}
