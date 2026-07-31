import { Article } from '../services/api.service';

/** Canonical public path for an enseignement (slug only). */
export function articleSharePath(article: Pick<Article, 'slug'>): string {
  const slug = article.slug?.trim();
  if (!slug) {
    throw new Error('Article slug is required for public links');
  }
  return `/enseignements/${encodeURIComponent(slug)}`;
}

/** Gallery deep-link on the home page (works across pagination). */
export function gallerySharePath(photoId: number): string {
  return `/?galerie=${encodeURIComponent(String(photoId))}`;
}

export function galleryShareQueryParams(photoId: number): Record<string, string> {
  return { galerie: String(photoId) };
}
