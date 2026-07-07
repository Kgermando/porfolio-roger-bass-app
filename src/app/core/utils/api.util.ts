import { HttpErrorResponse } from '@angular/common/http';

/** Backend GORM entities may expose ID or id depending on model */
export type WithId = { ID?: number; id?: number };

export function entityId(item: WithId): number {
  return item.ID ?? item.id ?? 0;
}

export function normalizeEntity<T extends WithId>(item: T): T & { ID: number } {
  return { ...item, ID: entityId(item) };
}

export function normalizeList<T extends WithId>(items: T[] | null | undefined): (T & { ID: number })[] {
  return (items ?? []).map(normalizeEntity);
}

export function extractApiError(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }
    if (err.status === 0) return 'Impossible de joindre le serveur API';
    if (err.status === 401) return 'Session expirée — reconnectez-vous';
    if (err.status === 403) return 'Accès refusé';
    if (err.status === 503) return 'Service de stockage non configuré (Backblaze B2)';
    if (err.status === 413) return 'Fichier trop volumineux';
  }
  return fallback;
}

export function formatArticleDate(article: { published_at?: string | null; CreatedAt?: string }): string | null {
  const raw = article.published_at || article.CreatedAt;
  if (!raw || raw.startsWith('0001-')) return null;
  return raw;
}

/** Strip HTML tags for plain-text previews */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
