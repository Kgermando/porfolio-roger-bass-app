import { Component, Input, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SITE_URL } from '../../core/utils/seo.util';
import { environment } from '../../../environments/environment';

type ShareChannel = 'whatsapp' | 'facebook' | 'twitter' | 'email';

@Component({
  selector: 'app-share-buttons',
  templateUrl: './share-buttons.html',
  styleUrl: './share-buttons.scss',
})
export class ShareButtons {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) path!: string;
  @Input() text = '';
  @Input() compact = false;

  private platformId = inject(PLATFORM_ID);

  copied = signal(false);
  canNativeShare = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.canNativeShare.set(typeof navigator.share === 'function');
    }
  }

  shareUrl(): string {
    const path = this.path.startsWith('/') ? this.path : `/${this.path}`;
    if (environment.production) {
      return `${SITE_URL}${path}`;
    }
    if (isPlatformBrowser(this.platformId)) {
      return `${window.location.origin}${path}`;
    }
    return `${SITE_URL}${path}`;
  }

  shareMessage(): string {
    const excerpt = this.text.trim();
    return excerpt ? `${this.title} — ${excerpt}` : this.title;
  }

  async nativeShare(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !navigator.share) return;
    try {
      await navigator.share({
        title: this.title,
        text: this.shareMessage(),
        url: this.shareUrl(),
      });
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') {
        this.copyLink();
      }
    }
  }

  async copyLink(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      await navigator.clipboard.writeText(this.shareUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      window.prompt('Copiez ce lien :', this.shareUrl());
    }
  }

  openShare(channel: ShareChannel): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const url = encodeURIComponent(this.shareUrl());
    const title = encodeURIComponent(this.title);
    const message = encodeURIComponent(this.shareMessage());

    const links: Record<ShareChannel, string> = {
      whatsapp: `https://wa.me/?text=${message}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      email: `mailto:?subject=${title}&body=${message}%0A%0A${url}`,
    };

    window.open(links[channel], '_blank', 'noopener,noreferrer,width=600,height=520');
  }
}
