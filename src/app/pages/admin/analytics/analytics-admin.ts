import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService, AnalyticsStats } from '../../../core/services/api.service';
import { extractApiError } from '../../../core/utils/api.util';

@Component({
  selector: 'app-analytics-admin',
  standalone: true,
  templateUrl: './analytics-admin.html',
  styleUrl: './analytics-admin.scss',
  imports: [DecimalPipe],
})
export class AnalyticsAdmin implements OnInit {
  private api = inject(ApiService);

  stats = signal<AnalyticsStats | null>(null);
  loading = signal(true);
  errorMsg = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.adminGetAnalytics().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: (err) => { this.errorMsg.set(extractApiError(err, 'Impossible de charger les statistiques')); this.loading.set(false); },
    });
  }

  maxDailyCount(): number {
    const daily = this.stats()?.daily_views ?? [];
    return Math.max(...daily.map((d) => d.count), 1);
  }
}
