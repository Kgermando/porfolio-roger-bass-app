import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private tracked = new Set<string>();

  trackPageView(pagePath?: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const path = pagePath ?? window.location.pathname + window.location.hash;
    const key = `${path}:${new Date().toDateString()}`;
    if (this.tracked.has(key)) return;
    this.tracked.add(key);

    this.api.trackPageView({
      page_path: path || '/',
      referrer: document.referrer || '',
    }).subscribe({ error: () => {/* silent */} });
  }
}
