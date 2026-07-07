import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard } from './core/guards/auth.guard';
import { articleResolver } from './core/resolvers/article.resolver';

export const routes: Routes = [
  { path: '', component: Home, title: 'Roger Bass | Guitariste & Prédicateur' },

  {
    path: 'enseignements/:slug',
    loadComponent: () =>
      import('./pages/article-detail/article-detail').then((m) => m.ArticleDetail),
    resolve: { article: articleResolver },
    title: 'Enseignement — Roger Bass',
  },

  // Admin section — lazy loaded
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./pages/admin/login/login').then((m) => m.AdminLogin),
    title: 'Admin — Connexion',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard').then((m) => m.AdminDashboard),
    canActivate: [authGuard],
    title: 'Admin — Tableau de bord',
    children: [
      { path: '', redirectTo: 'analytics', pathMatch: 'full' },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./pages/admin/analytics/analytics-admin').then((m) => m.AnalyticsAdmin),
        title: 'Admin — Statistiques',
      },
      {
        path: 'works',
        loadComponent: () =>
          import('./pages/admin/works/works-admin').then((m) => m.WorksAdmin),
        title: 'Admin — Vidéos',
      },
      {
        path: 'articles',
        loadComponent: () =>
          import('./pages/admin/articles/articles-admin').then((m) => m.ArticlesAdmin),
        title: 'Admin — Enseignements',
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/admin/events/events-admin').then((m) => m.EventsAdmin),
        title: 'Admin — Agenda',
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/admin/messages/messages-admin').then((m) => m.MessagesAdmin),
        title: 'Admin — Messages',
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./pages/admin/gallery/gallery-admin').then((m) => m.GalleryAdmin),
        title: 'Admin — Galerie',
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
