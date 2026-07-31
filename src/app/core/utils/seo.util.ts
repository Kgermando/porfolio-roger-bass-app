import { Article } from '../services/api.service';
import { stripHtml } from './api.util';
import { SeoData } from '../services/seo.service';
import { articleSharePath } from './share.util';
import { SITE_URL } from './site.config';

export { SITE_URL } from './site.config';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/rogerbass2.jpeg`;
export const SITE_NAME = 'Roger Bass Portfolio';
export const DEFAULT_DESCRIPTION =
  'Portfolio officiel de Mukendi Kadiayi Roger Bass, guitariste professionnel depuis 2008. Vidéos YouTube, enseignements édifiants, galerie photos, agenda concerts et services musicaux en RDC.';

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function articleShareUrl(article: Pick<Article, 'slug'>): string {
  return absoluteUrl(articleSharePath(article));
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

export function buildHomeSeo(): SeoData {
  return {
    title: 'Roger Bass | Guitariste & Prédicateur – Mukendi Kadiayi Roger Bass',
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_OG_IMAGE,
    imageAlt: 'Mukendi Kadiayi Roger Bass – Guitariste Professionnel',
    url: `${SITE_URL}/`,
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Mukendi Kadiayi Roger Bass',
        alternateName: 'Roger Bass',
        description:
          'Guitariste professionnel depuis 2008, maîtrisant guitare solo, accompagnement, basse et synthétiseur.',
        url: SITE_URL,
        image: DEFAULT_OG_IMAGE,
        jobTitle: 'Guitariste Professionnel',
        email: 'mukendirogerbass@gmail.com',
        telephone: '+243853993852',
        birthDate: '1990-12-25',
        birthPlace: {
          '@type': 'Place',
          name: 'Mbujimayi, Kasaï-Oriental, République Démocratique du Congo',
        },
        knowsAbout: [
          'Guitare Solo',
          'Guitare Basse',
          'Guitare Accompagnement',
          'Synthétiseur',
          'Cours de guitare',
          'Enseignements édifiants',
          'Musique chrétienne',
        ],
        sameAs: [
          'https://www.facebook.com/rogerbass.mukendikadiayi',
          'https://youtube.com/@rogerbassmukendi4992',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'fr-FR',
        publisher: {
          '@type': 'Person',
          name: 'Mukendi Kadiayi Roger Bass',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: 'Roger Bass — Services musicaux',
        url: `${SITE_URL}/#services`,
        areaServed: {
          '@type': 'Country',
          name: 'République Démocratique du Congo',
        },
        provider: {
          '@type': 'Person',
          name: 'Mukendi Kadiayi Roger Bass',
        },
      },
    ],
  };
}

export function buildArticleSeo(article: Article): SeoData {
  const description = articleDescription(article);
  const image = articleOgImage(article);
  const url = articleShareUrl(article);
  const published = article.published_at || article.CreatedAt;

  return {
    title: `${article.title} | Enseignements — Roger Bass`,
    description,
    image,
    imageAlt: article.title,
    url,
    type: 'article',
    publishedTime: published,
    author: article.author || 'Mukendi Kadiayi Roger Bass',
    jsonLd: [
      {
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
        datePublished: published,
        dateModified: article.UpdatedAt ?? published,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
        url,
        inLanguage: 'fr-FR',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_URL}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Enseignements',
            item: `${SITE_URL}/#enseignements`,
          },
          { '@type': 'ListItem', position: 3, name: article.title, item: url },
        ],
      },
    ],
  };
}

export function buildAdminNoIndexSeo(title: string): SeoData {
  return {
    title: `${title} — Admin Roger Bass`,
    description: 'Espace d’administration privé.',
    robots: 'noindex, nofollow',
  };
}
