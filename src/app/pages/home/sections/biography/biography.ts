import { Component } from '@angular/core';

interface TimelineEvent {
  year: string;
  title: string;
  desc: string;
  icon: string;
}

@Component({
  selector: 'app-biography',
  templateUrl: './biography.html',
  styleUrl: './biography.scss',
})
export class BiographySection {
  timeline: TimelineEvent[] = [
    {
      year: '1990',
      title: 'Naissance à Mbujimayi',
      desc: 'Né le 25 décembre 1990 à Mbujimayi, Kasaï-Oriental, République Démocratique du Congo.',
      icon: '🌟',
    },
    {
      year: '2008',
      title: 'Premier accord, première passion',
      desc: 'Découverte de la guitare et début d\'une passion indéfectible pour la musique. Apprentissage autodidacte et rapide maîtrise de l\'instrument.',
      icon: '🎸',
    },
    {
      year: '2010',
      title: 'Diversification musicale',
      desc: 'Extension du répertoire musical : maîtrise de la guitare accompagnement, de la guitare solo et de la basse. Introduction au synthétiseur.',
      icon: '🎹',
    },
    {
      year: '2014',
      title: 'Formation académique',
      desc: 'Obtention du diplôme de graduat en Mathématiques et Informatique (ISTIA MBM), alliant passion musicale et rigueur académique.',
      icon: '🎓',
    },
    {
      year: '2016',
      title: 'Mariage & nouvelle inspiration',
      desc: 'Union avec Madame Joëlle Nzeba Kayemba. La famille devient une nouvelle source d\'inspiration et d\'énergie artistique.',
      icon: '💍',
    },
    {
      year: '2018',
      title: 'Licence universitaire',
      desc: 'Diplôme de licence en Sciences commerciales et administratives (ISP MBM). La discipline académique nourrit l\'approche professionnelle de la musique.',
      icon: '🎓',
    },
    {
      year: '2020',
      title: 'Expansion artistique',
      desc: 'Consolidation du style musical unique, mêlant influences traditionnelles africaines et modernité. Début des prestations événementielles.',
      icon: '🎵',
    },
    {
      year: '2025',
      title: 'Portfolio en ligne',
      desc: 'Lancement du portfolio digital pour partager son parcours, ses œuvres et ses services avec le monde entier.',
      icon: '🌐',
    },
  ];
}
