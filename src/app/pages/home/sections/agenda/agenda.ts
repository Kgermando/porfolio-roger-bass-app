import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService, PortfolioEvent } from '../../../../core/services/api.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
  imports: [DatePipe],
})
export class AgendaSection implements OnInit {
  private api = inject(ApiService);

  events = signal<PortfolioEvent[]>([]);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.api.getEvents().subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
