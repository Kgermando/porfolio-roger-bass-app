import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutSection {
  stats = [
    { value: '15+', label: 'Ans d\'expérience' },
    { value: '4', label: 'Instruments maîtrisés' },
    { value: '∞', label: 'Passion musicale' },
    { value: '3', label: 'Enfants et famille' },
  ];
}
