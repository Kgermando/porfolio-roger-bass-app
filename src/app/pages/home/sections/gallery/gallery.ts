import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService, GalleryPhoto } from '../../../../core/services/api.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class GallerySection implements OnInit {
  private api = inject(ApiService);

  photos = signal<GalleryPhoto[]>([]);
  loading = signal(true);
  error = signal(false);
  activeIndex = signal<number | null>(null);

  ngOnInit(): void {
    this.api.getGallery().subscribe({
      next: (data) => { this.photos.set(data); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
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
