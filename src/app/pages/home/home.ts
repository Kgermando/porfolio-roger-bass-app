import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { HeroSection } from './sections/hero/hero';
import { AboutSection } from './sections/about/about';
import { BiographySection } from './sections/biography/biography';
import { WorksSection } from './sections/works/works';
import { GallerySection } from './sections/gallery/gallery';
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
    AgendaSection,
    ServicesSection,
    ContactSection,
  ],
})
export class Home implements OnInit {
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.seo.update({
      title: 'Roger Bass | Guitariste Professionnel – Mukendi Kadiayi Roger Bass',
      description:
        'Portfolio officiel de Mukendi Kadiayi Roger Bass, guitariste professionnel depuis 2008. Guitare solo, accompagnement, basse et synthétiseur. Cours, sessions studio et prestations événementielles.',
      image: 'https://rogerbass.com/images/rogerbass2.jpeg',
      imageAlt: 'Mukendi Kadiayi Roger Bass – Guitariste Professionnel',
      url: 'https://rogerbass.com/',
      type: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Mukendi Kadiayi Roger Bass',
          alternateName: 'Roger Bass',
          description:
            'Guitariste professionnel depuis 2008, maîtrisant guitare solo, accompagnement, basse et synthétiseur.',
          url: 'https://rogerbass.com',
          image: 'https://rogerbass.com/images/rogerbass2.jpeg',
          jobTitle: 'Guitariste Professionnel',
          email: 'mukendirogerbass@gmail.com',
          telephone: '+243853993852',
          birthDate: '1990-12-25',
          birthPlace: {
            '@type': 'Place',
            name: 'Mbujimayi, Kasaï-Oriental, République Démocratique du Congo',
          },
          knowsAbout: [
            'Guitare Solo',
            'Guitare Basse',
            'Guitare Accompagnement',
            'Synthétiseur',
            'Cours de guitare',
          ],
          sameAs: [
            'https://www.facebook.com/rogerbass.mukendikadiayi',
            'https://youtube.com/@rogerbassmukendi4992',
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Roger Bass Portfolio',
          url: 'https://rogerbass.com',
          description:
            'Portfolio officiel de Mukendi Kadiayi Roger Bass, guitariste professionnel.',
          inLanguage: 'fr-FR',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://rogerbass.com/?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Accueil',
              item: 'https://rogerbass.com/',
            },
          ],
        },
      ],
    });

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
