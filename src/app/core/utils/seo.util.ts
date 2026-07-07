import { Article } from '../services/api.service';
import { stripHtml } from './api.util';
import { SeoData } from '../services/seo.service';

export const SITE_URL = 'https://rogerbass.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/rogerbass2.jpeg`;
export const SITE_NAME = 'Roger Bass Portfolio';

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function articleShareUrl(slug: string): string {
  return `${SITE_URL}/enseignements/${slug}`;
}

export function articleDescription(article: Article): string {
  const excerpt = article.excerpt?.trim();
  if (excerpt) return stripHtml(excerpt).slice(0, 200);
  return stripHtml(article.content).slice(0, 200);
}

export function articleOgImage(article: Article): string {
  const cover = article.cover_image?.trim();
  return cover ? absoluteUrl(cover) : DEFAULT_OG_IMAGE;
}

export function buildArticleSeo(article: Article): SeoData {
  const description = articleDescription(article);
  const image = articleOgImage(article);
  const url = articleShareUrl(article.slug);

  return {
    title: `${article.title} | Enseignements — Roger Bass`,
    description,
    image,
    imageAlt: article.title,
    url,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description,
      image: [image],
      author: {
        '@type': 'Person',
        name: article.author || 'Mukendi Kadiayi Roger Bass',
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: DEFAULT_OG_IMAGE,
        },
      },
      datePublished: article.published_at || article.CreatedAt,
      mainEntityOfPage: url,
      url,
    },
  };
}
