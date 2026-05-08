import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-services',
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class ServicesSection {
  private platformId = inject(PLATFORM_ID);

  services = [
    {
      icon: '🎸',
      title: 'Cours de Guitare',
      desc: 'Des cours personnalisés adaptés à tous les niveaux — débutant, intermédiaire ou avancé. Maîtrisez la guitare acoustique, électrique, basse ou la technique fingerstyle.',
      features: [
        'Cours individuels ou en groupe',
        'Tous styles : gospel, jazz, afrobeat, classique',
        'Matériel pédagogique fourni',
        'Cours en présentiel ou en ligne',
      ],
      cta: 'Réserver un cours',
    },
    {
      icon: '🎵',
      title: 'Sessions Studio & Collaborations',
      desc: 'Enregistrements professionnels, arrangements musicaux et collaborations artistiques pour vos projets musicaux, albums ou productions audiovisuelles.',
      features: [
        'Enregistrement guitare & basse',
        'Arrangements pour ensembles',
        'Production et mixage',
        'Collaborations avec artistes',
      ],
      cta: 'Discuter de votre projet',
    },
    {
      icon: '🎤',
      title: 'Prestations Événementielles',
      desc: 'Des performances musicales live de haute qualité pour vos événements : mariages, galas, soirées privées, festivals et cérémonies religieuses.',
      features: [
        'Mariages & cérémonies',
        'Soirées privées & galas',
        'Festivals & concerts',
        'Célébrations religieuses',
      ],
      cta: 'Demander un devis',
    },
  ];

  scrollToContact(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
