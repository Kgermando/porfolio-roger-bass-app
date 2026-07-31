import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl } from '../utils/seo.util';

export interface SeoData {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  author?: string;
  robots?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);

  update(data: SeoData): void {
    const image = data.image ? absoluteUrl(data.image) : DEFAULT_OG_IMAGE;

    if (data.title) {
      this.title.setTitle(data.title);
      this.setTag('property', 'og:title', data.title);
      this.setTag('name', 'twitter:title', data.title);
    }

    if (data.description) {
      this.setTag('name', 'description', data.description);
      this.setTag('property', 'og:description', data.description);
      this.setTag('name', 'twitter:description', data.description);
    }

    this.setTag('property', 'og:image', image);
    this.setTag('property', 'og:image:secure_url', image);
    this.setTag('name', 'twitter:image', image);
    this.setTag('name', 'twitter:card', 'summary_large_image');
    this.setTag('property', 'og:site_name', SITE_NAME);
    this.setTag('property', 'og:locale', 'fr_FR');

    if (data.imageAlt) {
      this.setTag('property', 'og:image:alt', data.imageAlt);
      this.setTag('name', 'twitter:image:alt', data.imageAlt);
    }

    const pageUrl = data.url ? absoluteUrl(data.url) : absoluteUrl('/');
    this.setTag('property', 'og:url', pageUrl);
    this.setCanonicalUrl(pageUrl);

    const ogType = data.type ?? 'website';
    this.setTag('property', 'og:type', ogType);

    if (data.publishedTime) {
      this.setTag('property', 'article:published_time', data.publishedTime);
    }
    if (data.author) {
      this.setTag('property', 'article:author', data.author);
      this.setTag('name', 'author', data.author);
    }

    const robots = data.robots ?? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    this.setTag('name', 'robots', robots);
    this.setTag('name', 'googlebot', robots);

    if (data.jsonLd) {
      this.setJsonLd(data.jsonLd);
    }
  }

  private setTag(attrSelector: 'name' | 'property', attrName: string, content: string): void {
    this.meta.updateTag({ [attrSelector]: attrName, content });
  }

  private setCanonicalUrl(url: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(data: Record<string, unknown> | Record<string, unknown>[]): void {
    const head = this.document.head;
    head.querySelectorAll('script[type="application/ld+json"][data-seo]').forEach((el) => el.remove());

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'true');
    script.textContent = JSON.stringify(data);
    head.appendChild(script);
  }
}
