import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class AdminDashboard {
  auth = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  sidebarOpen = signal(false);

  navItems = [
    { path: '/admin/works', label: 'Vidéos', icon: '▶' },
    { path: '/admin/events', label: 'Agenda', icon: '📅' },
    { path: '/admin/gallery', label: 'Galerie', icon: '🖼️' },
    { path: '/admin/messages', label: 'Messages', icon: '✉' },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
