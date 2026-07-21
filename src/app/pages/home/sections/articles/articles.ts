import { Component, inject, OnInit, signal, PLATFORM_ID, ElementRef } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService, Article } from '../../../../core/services/api.service';
import { formatArticleDate, stripHtml } from '../../../../core/utils/api.util';
import { ShareButtons } from '../../../../shared/share-buttons/share-buttons';

@Component({
  selector: 'app-articles',
  standalone: true,
  templateUrl: './articles.html',
  styleUrl: './articles.scss',
  imports: [DatePipe, RouterLink, ShareButtons],
})
export class ArticlesSection implements OnInit {
  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef);

  articles = signal<Article[]>([]);
  loading = signal(true);
  error = signal(false);
  activeArticle = signal<Article | null>(null);

  ngOnInit(): void {
    this.api.getArticles().subscribe({
      next: (data) => {
        this.articles.set(data);
        this.loading.set(false);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initAosObserver(), 50);
        }
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  private initAosObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    this.elRef.nativeElement
      .querySelectorAll('.aos:not(.visible)')
      .forEach((el: Element) => observer.observe(el));
  }

  openPreview(article: Article, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.activeArticle.set(article);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
      this.api.getArticle(article.slug).subscribe({
        next: (full) => this.activeArticle.set(full),
      });
    }
  }

  closePreview(): void {
    this.activeArticle.set(null);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  articleDate(article: Article): string | null {
    return formatArticleDate(article);
  }

  excerptHtml(article: Article): SafeHtml | null {
    const raw = article.excerpt?.trim();
    if (raw && /<[^>]+>/.test(raw)) {
      return this.sanitizer.bypassSecurityTrustHtml(raw);
    }
    return null;
  }

  excerptText(article: Article): string {
    if (article.excerpt) return stripHtml(article.excerpt);
    return stripHtml(article.content).slice(0, 120);
  }

  safeContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content || '');
  }

  sharePath(article: Article): string {
    return `/enseignements/${article.slug}`;
  }

  shareText(article: Article): string {
    return article.excerpt ? stripHtml(article.excerpt) : stripHtml(article.content).slice(0, 120);
  }
}
