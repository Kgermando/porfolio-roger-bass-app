import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { buildHomeSeo } from '../../core/utils/seo.util';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { HeroSection } from './sections/hero/hero';
import { AboutSection } from './sections/about/about';
import { BiographySection } from './sections/biography/biography';
import { WorksSection } from './sections/works/works';
import { GallerySection } from './sections/gallery/gallery';
import { ArticlesSection } from './sections/articles/articles';
import { AgendaSection } from './sections/agenda/agenda';
import { ServicesSection } from './sections/services/services';
import { ContactSection } from './sections/contact/contact';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [
    Navbar,
    Footer,
    HeroSection,
    AboutSection,
    BiographySection,
    WorksSection,
    GallerySection,
    ArticlesSection,
    AgendaSection,
    ServicesSection,
    ContactSection,
  ],
})
export class Home implements OnInit {
  private seo = inject(SeoService);
  private analytics = inject(AnalyticsService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.seo.update(buildHomeSeo());

    this.analytics.trackPageView('/');

    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  private initScrollAnimations(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 },
    );

    const selector = '.aos, .aos-left, .aos-right';
    // Observe after a tick to let the DOM settle
    setTimeout(() => {
      document.querySelectorAll(selector).forEach((el) => observer.observe(el));
    }, 100);
  }
}
