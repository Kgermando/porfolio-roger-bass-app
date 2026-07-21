import { Component, inject, OnInit, signal, PLATFORM_ID, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService, Work, WorksPage } from '../../../../core/services/api.service';
import { ShareButtons } from '../../../../shared/share-buttons/share-buttons';

type Category = 'all' | 'performances' | 'tutoriels' | 'compositions' | 'concerts' | 'campagnes' | 'prières' | 'émissions' | 'enseignements';

@Component({
  selector: 'app-works',
  standalone: true,
  templateUrl: './works.html',
  styleUrl: './works.scss',
  imports: [ShareButtons],
})
export class WorksSection implements OnInit {
  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef);

  works = signal<Work[]>([]);
  loading = signal(true);
  error = signal(false);
  activeCategory = signal<Category>('all');
  activeVideoId = signal<string | null>(null);
  activeDirectVideo = signal<string | null>(null);

  // Pagination
  readonly limit = 6;
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);

  categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'performances', label: 'Performances' },
    { id: 'tutoriels', label: 'Tutoriels' },
    { id: 'compositions', label: 'Compositions' },
    { id: 'concerts', label: 'Concerts' },
    { id: 'campagnes', label: 'Campagnes' },
    { id: 'prières', label: 'Prières' },
    { id: 'émissions', label: 'Émissions' },
    { id: 'enseignements', label: 'Enseignements' },
  ];

  ngOnInit(): void {
    this.loadWorks();
  }

  loadWorks(category?: Category, page = 1): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.getWorks(category, page, this.limit).subscribe({
      next: (res: WorksPage) => {
        this.works.set(res.data ?? []);
        this.total.set(res.total ?? 0);
        this.totalPages.set(res.pages ?? 1);
        this.page.set(res.page ?? 1);
        this.loading.set(false);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.refreshAosAnimations(), 50);
        }
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  private refreshAosAnimations(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    this.elRef.nativeElement
      .querySelectorAll('.aos:not(.visible), .aos-left:not(.visible), .aos-right:not(.visible)')
      .forEach((el: Element) => observer.observe(el));
  }

  setCategory(cat: Category): void {
    this.activeCategory.set(cat);
    this.loadWorks(cat === 'all' ? undefined : cat, 1);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    const cat = this.activeCategory();
    this.loadWorks(cat === 'all' ? undefined : cat, p);
    // Scroll to section top
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('oeuvres')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  get pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.page();
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }
    return range;
  }

  /** Extracts the YouTube video ID from a URL, or null if not a video URL */
  getYouTubeId(url: string): string | null {
    if (!url || this.isDirectVideo(url)) return null;
    const patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /\/embed\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  getThumbnailUrl(url: string): string {
    const id = this.getYouTubeId(url);
    // maxresdefault (1280×720) — best quality; onerror in template falls back to hqdefault
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '';
  }

  onThumbError(img: HTMLImageElement, url: string): void {
    const id = this.getYouTubeId(url);
    if (id && !img.src.includes('hqdefault')) {
      img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    } else {
      img.classList.add('works__thumb-fallback');
      img.removeAttribute('src');
    }
  }

  getSafeEmbedUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
    );
  }

  playVideo(url: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.isDirectVideo(url)) {
      this.activeDirectVideo.set(url);
      this.activeVideoId.set(null);
      document.body.style.overflow = 'hidden';
      return;
    }

    const id = this.getYouTubeId(url);
    if (id) {
      this.activeVideoId.set(id);
      this.activeDirectVideo.set(null);
      document.body.style.overflow = 'hidden';
    }
  }

  closeVideo(): void {
    this.activeVideoId.set(null);
    this.activeDirectVideo.set(null);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  isDirectVideo(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return !lower.includes('youtube.com') && !lower.includes('youtu.be') &&
      (lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov') || lower.includes('backblazeb2.com'));
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  shareUrl(work: Work): string {
    if (work.link) return work.link;
    return 'https://youtube.com/@rogerbassmukendi4992';
  }

  onShareClick(e: Event): void {
    e.stopPropagation();
  }
}
