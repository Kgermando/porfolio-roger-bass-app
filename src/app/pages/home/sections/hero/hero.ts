import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class HeroSection {
  private platformId = inject(PLATFORM_ID);

  scrollTo(id: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollDown(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('apropos')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  waveBars = Array.from({ length: 20 }, (_, i) => i);
}
