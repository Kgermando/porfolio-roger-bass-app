import { Component, inject, OnInit, signal, PLATFORM_ID, ElementRef, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService, GalleryPhoto } from '../../../../core/services/api.service';
import { galleryShareQueryParams } from '../../../../core/utils/share.util';
import { ShareButtons } from '../../../../shared/share-buttons/share-buttons';

@Component({
  selector: 'app-gallery',
  standalone: true,
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
  imports: [ShareButtons],
})
export class GallerySection implements OnInit {
  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef);

  photos = signal<GalleryPhoto[]>([]);
  loading = signal(true);
  error = signal(false);
  activeIndex = signal<number | null>(null);
  slideDirection = signal<'left' | 'right' | 'none'>('none');

  readonly limit = 8;
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);

  private touchStartX = 0;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const mediaId = new URLSearchParams(window.location.search).get('galerie');
      if (mediaId) {
        this.openSharedMediaById(mediaId);
      } else {
        this.loadGallery(1);
      }
    } else {
      this.loading.set(false);
    }
  }

  loadGallery(page = 1, afterLoad?: () => void): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.getGallery(page, this.limit).subscribe({
      next: (res) => {
        this.photos.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(Math.max(1, res.pages));
        this.page.set(res.page);
        this.loading.set(false);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initAosObserver(), 50);
          afterLoad?.();
        }
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  private openSharedMediaById(mediaId: string): void {
    this.api.getGalleryPhoto(mediaId, this.limit).subscribe({
      next: ({ photo, page }) => {
        this.loadGallery(page, () => {
          const idx = this.photos().findIndex((p) => String(p.ID) === String(photo.ID));
          if (idx >= 0) {
            this.open(idx);
          } else {
            this.photos.update((list) => [photo, ...list.filter((p) => p.ID !== photo.ID)]);
            this.open(0);
          }
          this.scrollToGallery();
        });
      },
      error: () => this.loadGallery(1),
    });
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.close();
    this.loadGallery(p);
    if (isPlatformBrowser(this.platformId)) {
      this.scrollToGallery();
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

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (this.activeIndex() === null) return;
    if (e.key === 'Escape') this.close();
    if (e.key === 'ArrowLeft') this.prev(e);
    if (e.key === 'ArrowRight') this.next(e);
  }

  private initAosObserver(): void {
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

  private scrollToGallery(): void {
    document.getElementById('galerie')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  isVideo(src: string): boolean {
    if (!src) return false;
    const lower = src.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return true;
    return !lower.includes('youtube.com') && !lower.includes('youtu.be') &&
      (lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov') ||
        (lower.includes('backblazeb2.com') && !/\.(jpe?g|png|gif|webp)(\?|$)/i.test(lower)));
  }

  getYouTubeId(url: string): string | null {
    if (!url) return null;
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

  getSafeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getSafeEmbedUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
    );
  }

  mediaTitle(photo: GalleryPhoto): string {
    return photo.caption || photo.alt || 'Média Roger Bass';
  }

  sharePageParams(photo: GalleryPhoto): Record<string, string> {
    return galleryShareQueryParams(photo.ID);
  }

  open(index: number): void {
    this.activeIndex.set(index);
    this.slideDirection.set('none');
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  close(): void {
    this.activeIndex.set(null);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  prev(e?: Event): void {
    e?.stopPropagation();
    const idx = this.activeIndex();
    if (idx === null) return;
    const total = this.photos().length;
    this.slideDirection.set('right');
    this.activeIndex.set((idx - 1 + total) % total);
  }

  next(e?: Event): void {
    e?.stopPropagation();
    const idx = this.activeIndex();
    if (idx === null) return;
    const total = this.photos().length;
    this.slideDirection.set('left');
    this.activeIndex.set((idx + 1) % total);
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].clientX;
  }

  onTouchEnd(e: TouchEvent): void {
    const diff = e.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) this.prev();
    else this.next();
  }

  onShareClick(e: Event): void {
    e.stopPropagation();
  }

  onImgError(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.style.visibility = 'hidden';
  }
}
