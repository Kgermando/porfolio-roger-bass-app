import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ApiService, Article } from '../services/api.service';

export const articleResolver: ResolveFn<Article | null> = (route) => {
  const slug = route.paramMap.get('slug');
  if (!slug) return of(null);

  return inject(ApiService).getArticle(slug).pipe(
    catchError(() => of(null)),
  );
};
