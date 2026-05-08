import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoData {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);

  update(data: SeoData): void {
    if (data.title) {
      this.title.setTitle(data.title);
      this.meta.updateTag({ property: 'og:title', content: data.title });
      this.meta.updateTag({ name: 'twitter:title', content: data.title });
    }
    if (data.description) {
      this.meta.updateTag({ name: 'description', content: data.description });
      this.meta.updateTag({ property: 'og:description', content: data.description });
      this.meta.updateTag({ name: 'twitter:description', content: data.description });
    }
    if (data.image) {
      this.meta.updateTag({ property: 'og:image', content: data.image });
      this.meta.updateTag({ name: 'twitter:image', content: data.image });
    }
    if (data.imageAlt) {
      this.meta.updateTag({ property: 'og:image:alt', content: data.imageAlt });
    }
    if (data.url) {
      this.meta.updateTag({ property: 'og:url', content: data.url });
      this.setCanonicalUrl(data.url);
    }
    if (data.type) {
      this.meta.updateTag({ property: 'og:type', content: data.type });
    }
    if (data.jsonLd) {
      this.setJsonLd(data.jsonLd);
    }
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
    // Remove any previously injected dynamic JSON-LD (identified by data-seo attr)
    head.querySelectorAll('script[type="application/ld+json"][data-seo]').forEach(el => el.remove());

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'true');
    script.textContent = JSON.stringify(Array.isArray(data) ? data : data);
    head.appendChild(script);
  }
}
