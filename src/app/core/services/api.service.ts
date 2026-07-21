import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiError, normalizeEntity, normalizeList } from '../utils/api.util';

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface Work {
  ID: number;
  title: string;
  category: string;
  desc: string;
  link: string;
  is_active: boolean;
  sort_order: number;
}

export interface WorksPage {
  data: Work[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PortfolioEvent {
  ID: number;
  title: string;
  description: string;
  location: string;
  date: string;
  image_url: string;
  is_active: boolean;
}

export interface Contact {
  ID: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  CreatedAt: string;
}

export interface GalleryPhoto {
  ID: number;
  src: string;
  alt: string;
  caption: string;
  is_active: boolean;
  sort_order: number;
}

export interface GalleryPage {
  data: GalleryPhoto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Article {
  ID: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  is_published: boolean;
  sort_order: number;
  view_count: number;
  published_at?: string | null;
  CreatedAt: string;
}

export interface AnalyticsStats {
  total_views: number;
  views_today: number;
  views_week: number;
  views_month: number;
  by_country: { country_code: string; country: string; count: number }[];
  by_page: { page_path: string; count: number }[];
  daily_views: { date: string; count: number }[];
}

export interface UploadResponse {
  url: string;
  type: 'image' | 'video';
}

export interface ArticleInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  author?: string;
  is_published?: boolean;
  sort_order?: number;
}

export interface WorkInput {
  title: string;
  category: string;
  desc?: string;
  link?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface GalleryInput {
  src: string;
  alt?: string;
  caption?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface EventInput {
  title: string;
  description?: string;
  location?: string;
  date: string;
  image_url?: string;
  is_active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ── Public ────────────────────────────────────────
  submitContact(data: ContactForm): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(`${this.apiUrl}/contact`, data);
  }

  getEvents(): Observable<PortfolioEvent[]> {
    return this.http.get<PortfolioEvent[]>(`${this.apiUrl}/events`).pipe(
      map(normalizeList),
    );
  }

  getWorks(category?: string, page = 1, limit = 6): Observable<WorksPage> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    if (category && category !== 'all') {
      params = params.set('category', category);
    }
    return this.http.get<WorksPage>(`${this.apiUrl}/works`, { params }).pipe(
      map((res) => ({ ...res, data: normalizeList(res.data) })),
    );
  }

  getGallery(page = 1, limit = 8): Observable<GalleryPage> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<GalleryPage | GalleryPhoto[]>(`${this.apiUrl}/gallery`, { params }).pipe(
      map((res) => {
        if (Array.isArray(res)) {
          const data = normalizeList(res);
          const total = data.length;
          const pages = Math.max(1, Math.ceil(total / limit));
          return { data, total, page, limit, pages };
        }
        const data = normalizeList(res.data);
        const total = res.total ?? data.length;
        const pages = Math.max(1, res.pages ?? Math.ceil(total / limit));
        return { data, total, page: res.page ?? page, limit: res.limit ?? limit, pages };
      }),
    );
  }

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/articles`).pipe(
      map(normalizeList),
    );
  }

  getArticle(slug: string): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/articles/${encodeURIComponent(slug)}`).pipe(
      map(normalizeEntity),
    );
  }

  trackPageView(data: { page_path: string; referrer: string }): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.apiUrl}/analytics/track`, data);
  }

  // ── Admin — Works ─────────────────────────────────
  adminGetWorks(): Observable<Work[]> {
    return this.http.get<Work[]>(`${this.apiUrl}/admin/works`).pipe(map(normalizeList));
  }

  adminCreateWork(work: WorkInput): Observable<Work> {
    return this.http.post<Work>(`${this.apiUrl}/admin/works`, work).pipe(map(normalizeEntity));
  }

  adminUpdateWork(id: number, work: WorkInput): Observable<Work> {
    return this.http.put<Work>(`${this.apiUrl}/admin/works/${id}`, work).pipe(map(normalizeEntity));
  }

  adminDeleteWork(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/works/${id}`);
  }

  // ── Admin — Events ────────────────────────────────
  adminGetEvents(): Observable<PortfolioEvent[]> {
    return this.http.get<PortfolioEvent[]>(`${this.apiUrl}/admin/events`).pipe(map(normalizeList));
  }

  adminCreateEvent(event: EventInput): Observable<PortfolioEvent> {
    return this.http.post<PortfolioEvent>(`${this.apiUrl}/admin/events`, event).pipe(map(normalizeEntity));
  }

  adminUpdateEvent(id: number, event: EventInput): Observable<PortfolioEvent> {
    return this.http.put<PortfolioEvent>(`${this.apiUrl}/admin/events/${id}`, event).pipe(map(normalizeEntity));
  }

  adminDeleteEvent(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/events/${id}`);
  }

  // ── Admin — Contacts ──────────────────────────────
  adminGetContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/admin/contacts`).pipe(map(normalizeList));
  }

  adminMarkRead(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/admin/contacts/${id}/read`, {});
  }

  adminDeleteContact(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/contacts/${id}`);
  }

  // ── Admin — Gallery ───────────────────────────────
  adminGetGallery(): Observable<GalleryPhoto[]> {
    return this.http.get<GalleryPhoto[]>(`${this.apiUrl}/admin/gallery`).pipe(map(normalizeList));
  }

  adminCreateGalleryPhoto(photo: GalleryInput): Observable<GalleryPhoto> {
    return this.http.post<GalleryPhoto>(`${this.apiUrl}/admin/gallery`, photo).pipe(map(normalizeEntity));
  }

  adminUpdateGalleryPhoto(id: number, photo: GalleryInput): Observable<GalleryPhoto> {
    return this.http.put<GalleryPhoto>(`${this.apiUrl}/admin/gallery/${id}`, photo).pipe(map(normalizeEntity));
  }

  adminDeleteGalleryPhoto(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/gallery/${id}`);
  }

  // ── Admin — Articles ──────────────────────────────
  adminGetArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/admin/articles`).pipe(map(normalizeList));
  }

  adminCreateArticle(article: ArticleInput): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/admin/articles`, article).pipe(map(normalizeEntity));
  }

  adminUpdateArticle(id: number, article: ArticleInput): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/admin/articles/${id}`, article).pipe(map(normalizeEntity));
  }

  adminToggleArticlePublish(id: number): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/admin/articles/${id}/publish`, {}).pipe(map(normalizeEntity));
  }

  adminDeleteArticle(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/articles/${id}`);
  }

  // ── Admin — Analytics ─────────────────────────────
  adminGetAnalytics(): Observable<AnalyticsStats> {
    return this.http.get<AnalyticsStats>(`${this.apiUrl}/admin/analytics/stats`);
  }

  // ── Admin — Media upload (Backblaze B2) ───────────
  uploadImage(file: File): Observable<UploadResponse> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<UploadResponse>(`${this.apiUrl}/admin/upload`, fd);
  }

  uploadVideo(file: File): Observable<UploadResponse> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<UploadResponse>(`${this.apiUrl}/admin/upload/video`, fd);
  }

  /** @deprecated Use extractApiError from api.util */
  static extractError = extractApiError;
}
