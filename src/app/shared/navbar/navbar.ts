import { Component, HostListener, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface NavItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private platformId = inject(PLATFORM_ID);

  isScrolled = signal(false);
  isOpen = signal(false);

  navItems: NavItem[] = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'apropos', label: 'À Propos' },
    { id: 'biographie', label: 'Biographie' },
    { id: 'oeuvres', label: 'Œuvres' },
    { id: 'galerie', label: 'Galerie' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'services', label: 'Services' },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 60);
    }
  }

  toggleMenu(): void {
    this.isOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isOpen.set(false);
  }

  scrollTo(id: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
