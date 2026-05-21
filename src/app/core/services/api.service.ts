import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ── Public ────────────────────────────────────────
  submitContact(data: ContactForm): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(`${this.apiUrl}/contact`, data);
  }

  getEvents(): Observable<PortfolioEvent[]> {
    return this.http.get<PortfolioEvent[]>(`${this.apiUrl}/events`);
  }

  getWorks(category?: string, page = 1, limit = 6): Observable<WorksPage> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    params.set('page', String(page));
    params.set('limit', String(limit));
    return this.http.get<WorksPage>(`${this.apiUrl}/works?${params.toString()}`);
  }

  getGallery(): Observable<GalleryPhoto[]> {
    return this.http.get<GalleryPhoto[]>(`${this.apiUrl}/gallery`);
  }

  // ── Admin — Works ─────────────────────────────────
  adminGetWorks(): Observable<Work[]> {
    return this.http.get<Work[]>(`${this.apiUrl}/admin/works`);
  }

  adminCreateWork(work: Partial<Work>): Observable<Work> {
    return this.http.post<Work>(`${this.apiUrl}/admin/works`, work);
  }

  adminUpdateWork(id: number, work: Partial<Work>): Observable<Work> {
    return this.http.put<Work>(`${this.apiUrl}/admin/works/${id}`, work);
  }

  adminDeleteWork(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/works/${id}`);
  }

  // ── Admin — Events ────────────────────────────────
  adminGetEvents(): Observable<PortfolioEvent[]> {
    return this.http.get<PortfolioEvent[]>(`${this.apiUrl}/admin/events`);
  }

  adminCreateEvent(event: Partial<PortfolioEvent>): Observable<PortfolioEvent> {
    return this.http.post<PortfolioEvent>(`${this.apiUrl}/admin/events`, event);
  }

  adminUpdateEvent(id: number, event: Partial<PortfolioEvent>): Observable<PortfolioEvent> {
    return this.http.put<PortfolioEvent>(`${this.apiUrl}/admin/events/${id}`, event);
  }

  adminDeleteEvent(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/events/${id}`);
  }

  // ── Admin — Contacts ──────────────────────────────
  adminGetContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/admin/contacts`);
  }

  adminMarkRead(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/admin/contacts/${id}/read`, {});
  }

  adminDeleteContact(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/contacts/${id}`);
  }

  // ── Admin — Gallery ───────────────────────────────
  adminGetGallery(): Observable<GalleryPhoto[]> {
    return this.http.get<GalleryPhoto[]>(`${this.apiUrl}/admin/gallery`);
  }

  adminCreateGalleryPhoto(photo: Partial<GalleryPhoto>): Observable<GalleryPhoto> {
    return this.http.post<GalleryPhoto>(`${this.apiUrl}/admin/gallery`, photo);
  }

  adminUpdateGalleryPhoto(id: number, photo: Partial<GalleryPhoto>): Observable<GalleryPhoto> {
    return this.http.put<GalleryPhoto>(`${this.apiUrl}/admin/gallery/${id}`, photo);
  }

  adminDeleteGalleryPhoto(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/gallery/${id}`);
  }

  // ── Admin — Image upload (Backblaze B2) ───────────────────────────────────
  uploadImage(file: File): Observable<{ url: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/admin/upload`, fd);
  }
}
