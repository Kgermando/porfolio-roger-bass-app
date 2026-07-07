import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService, Article } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { formatArticleDate, stripHtml } from '../../core/utils/api.util';
import { buildArticleSeo } from '../../core/utils/seo.util';
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
      this.error.set(true);
      this.loading.set(false);
      return;
    }

    this.api.getArticle(slug).subscribe({
      next: (data) => this.applyArticle(data),
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
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
    return `/enseignements/${article.slug}`;
  }

  shareText(article: Article): string {
    return article.excerpt ? stripHtml(article.excerpt) : stripHtml(article.content).slice(0, 120);
  }
}
