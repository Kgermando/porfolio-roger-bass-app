import { Component, inject, OnInit, signal, PLATFORM_ID, ElementRef } from '@angular/core';
import { ApiService, PortfolioEvent } from '../../../../core/services/api.service';
import { DatePipe, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
  imports: [DatePipe],
})
export class AgendaSection implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef);

  events = signal<PortfolioEvent[]>([]);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.api.getEvents().subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.refreshAosAnimations(), 50);
        }
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private refreshAosAnimations(): void {
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
      .querySelectorAll('.aos:not(.visible), .aos-left:not(.visible), .aos-right:not(.visible)')
      .forEach((el: Element) => observer.observe(el));
  }
}
