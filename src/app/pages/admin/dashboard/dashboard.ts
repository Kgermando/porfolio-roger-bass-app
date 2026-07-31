import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { buildAdminNoIndexSeo } from '../../../core/utils/seo.util';

const PAGE_TITLES: Record<string, string> = {
  analytics: 'Statistiques',
  works: 'Vidéos',
  articles: 'Enseignements',
  events: 'Agenda',
  gallery: 'Galerie',
  messages: 'Messages',
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class AdminDashboard implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private seo = inject(SeoService);

  sidebarOpen = signal(false);
  pageTitle = signal('Tableau de bord');

  navItems = [
    { path: '/admin/analytics', label: 'Statistiques', icon: '📊' },
    { path: '/admin/works', label: 'Vidéos', icon: '▶' },
    { path: '/admin/articles', label: 'Enseignements', icon: '📖' },
    { path: '/admin/events', label: 'Agenda', icon: '📅' },
    { path: '/admin/gallery', label: 'Galerie', icon: '🖼️' },
    { path: '/admin/messages', label: 'Messages', icon: '✉' },
  ];

  ngOnInit(): void {
    this.seo.update(buildAdminNoIndexSeo('Administration'));
    this.updateTitle(this.router.url);
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.updateTitle((e as NavigationEnd).urlAfterRedirects);
    });
  }

  private updateTitle(url: string): void {
    const segment = url.split('/admin/')[1]?.split('/')[0]?.split('?')[0] ?? '';
    this.pageTitle.set(PAGE_TITLES[segment] ?? 'Tableau de bord');
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
