import { Component, inject, OnInit, signal, RESPONSE_INIT } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService, Article } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { formatArticleDate, stripHtml } from '../../core/utils/api.util';
import { buildArticleSeo } from '../../core/utils/seo.util';
import { articleSharePath } from '../../core/utils/share.util';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { ShareButtons } from '../../shared/share-buttons/share-buttons';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.scss',
  imports: [RouterLink, DatePipe, Navbar, Footer, ShareButtons],
})
export class ArticleDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private sanitizer = inject(DomSanitizer);
  private responseInit = inject(RESPONSE_INIT, { optional: true });

  article = signal<Article | null>(null);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['article'] as Article | null;

    if (resolved) {
      this.applyArticle(resolved);
      return;
    }

    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.markNotFound();
      return;
    }

    this.api.getArticle(decodeURIComponent(slug.trim())).subscribe({
      next: (data) => this.applyArticle(data),
      error: () => this.markNotFound(),
    });
  }

  private markNotFound(): void {
    this.error.set(true);
    this.loading.set(false);
    if (this.responseInit) {
      this.responseInit.status = 404;
    }
    this.seo.update({
      title: 'Enseignement introuvable | Roger Bass',
      description: 'Cet enseignement n\'existe pas ou n\'est plus disponible.',
      robots: 'noindex, nofollow',
    });
  }

  private applyArticle(data: Article): void {
    this.article.set(data);
    this.loading.set(false);
    this.seo.update(buildArticleSeo(data));
  }

  articleDate(article: Article): string | null {
    return formatArticleDate(article);
  }

  safeContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content || '');
  }

  sharePath(article: Article): string {
    return articleSharePath(article);
  }

  shareText(article: Article): string {
    return article.excerpt ? stripHtml(article.excerpt) : stripHtml(article.content).slice(0, 120);
  }
}

