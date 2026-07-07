import { Component, inject, OnInit, signal, PLATFORM_ID, ElementRef, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService, GalleryPhoto } from '../../../../core/services/api.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class GallerySection implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef);

  photos = signal<GalleryPhoto[]>([]);
  loading = signal(true);
  error = signal(false);
  activeIndex = signal<number | null>(null);
  slideDirection = signal<'left' | 'right' | 'none'>('none');

  private touchStartX = 0;

  ngOnInit(): void {
    this.api.getGallery().subscribe({
      next: (data) => {
        this.photos.set(data);
        this.loading.set(false);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initAosObserver(), 50);
        }
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initAosObserver(), 50);
    }
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

  onImgError(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.style.visibility = 'hidden';
  }
}
