import { Component, inject, OnInit, signal, PLATFORM_ID, ElementRef } from '@angular/core';
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
  }

  close(): void {
    this.activeIndex.set(null);
  }

  onImgError(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.style.visibility = 'hidden';
  }
}
