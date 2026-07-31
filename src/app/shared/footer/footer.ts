import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_URL } from '../../core/utils/site.config';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  imports: [RouterLink],
})
export class Footer {
  year = new Date().getFullYear();

  sitemapLinks = [
    {
      label: 'Sitemap XML',
      href: `${SITE_URL}/sitemap.xml`,
      title: 'Plan du site au format XML pour les moteurs de recherche',
    },
  ];

  socials = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/rogerbass.mukendikadiayi?mibextid=rS40aB7S9Ucbxw6v',
      icon: 'facebook',
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/@rogerbassmukendi4992?si=AxXDYdOrsPN8eYfY',
      icon: 'youtube',
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/mukendika/',
      icon: 'instagram',
    },
    {
      name: 'TikTok',
      href: 'https://vm.tiktok.com/ZS9NpTE9DswfB-y1Wqr/',
      icon: 'tiktok',
    },
  ];
}
