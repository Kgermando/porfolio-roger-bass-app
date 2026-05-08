import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService, Contact } from '../../../core/services/api.service';

@Component({
  selector: 'app-messages-admin',
  templateUrl: './messages-admin.html',
  styleUrl: './messages-admin.scss',
  imports: [DatePipe],
})
export class MessagesAdmin implements OnInit {
  private api = inject(ApiService);

  contacts = signal<Contact[]>([]);
  loading = signal(true);
  errorMsg = signal('');
  expanded = signal<number | null>(null);

  get unread(): number {
    return this.contacts().filter((c) => !c.is_read).length;
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.adminGetContacts().subscribe({
      next: (data: Contact[]) => { this.contacts.set(data); this.loading.set(false); },
      error: (_err: unknown) => { this.errorMsg.set('Impossible de charger les messages'); this.loading.set(false); },
    });
  }

  toggleExpand(id: number): void {
    const current = this.expanded();
    this.expanded.set(current === id ? null : id);
    // Mark as read on open
    const msg = this.contacts().find((c) => c.ID === id);
    if (msg && !msg.is_read) {
      this.api.adminMarkRead(id).subscribe({
        next: (_res: unknown) =>
          this.contacts.update((list) =>
            list.map((c) => (c.ID === id ? { ...c, is_read: true } : c)),
          ),
      });
    }
  }

  delete(contact: Contact): void {
    if (!confirm(`Supprimer le message de « ${contact.name} » ?`)) return;
    this.api.adminDeleteContact(contact.ID).subscribe({
      next: (_res: unknown) => this.contacts.update((list) => list.filter((c) => c.ID !== contact.ID)),
      error: (_err: unknown) => this.errorMsg.set('Erreur lors de la suppression'),
    });
  }
}
