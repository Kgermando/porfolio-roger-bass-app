import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { ApiService, Article } from '../services/api.service';
import { SeoService } from '../services/seo.service';
import { buildArticleSeo } from '../utils/seo.util';

export const articleResolver: ResolveFn<Article | null> = (route) => {
  const raw = route.paramMap.get('slug');
  if (!raw) return of(null);

  const slugOrId = decodeURIComponent(raw.trim());
  const seo = inject(SeoService);

  return inject(ApiService).getArticle(slugOrId).pipe(
    tap((article) => seo.update(buildArticleSeo(article))),
    catchError(() => of(null)),
  );
};
