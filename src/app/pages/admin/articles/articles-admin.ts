import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { QuillEditorComponent } from 'ngx-quill';
import { ApiService, Article } from '../../../core/services/api.service';
import { extractApiError, stripHtml } from '../../../core/utils/api.util';

function quillContentRequired(control: AbstractControl): ValidationErrors | null {
  const html = (control.value as string) ?? '';
  const text = stripHtml(html);
  return text.length > 0 ? null : { required: true };
}

@Component({
  selector: 'app-articles-admin',
  standalone: true,
  templateUrl: './articles-admin.html',
  styleUrl: './articles-admin.scss',
  imports: [ReactiveFormsModule, QuillEditorComponent],
})
export class ArticlesAdmin implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  articles = signal<Article[]>([]);
  loading = signal(true);
  saving = signal(false);
  uploading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  editingArticle = signal<Article | null>(null);
  showForm = signal(false);
  imagePreview = signal<SafeUrl | null>(null);

  readonly quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link'],
      ['clean'],
    ],
  };

  readonly quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'blockquote', 'list', 'indent', 'align', 'link',
  ];

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(300)]],
    slug: ['', Validators.maxLength(300)],
    excerpt: ['', Validators.maxLength(500)],
    content: ['', quillContentRequired],
    cover_image: [''],
    author: ['Roger Bass'],
    sort_order: [0],
    is_published: [false],
  });

  ngOnInit(): void { this.load(); }

  previewText(article: Article): string {
    if (article.excerpt) return article.excerpt;
    return stripHtml(article.content).slice(0, 100);
  }

  safeContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content || '');
  }

  load(): void {
    this.loading.set(true);
    this.api.adminGetArticles().subscribe({
      next: (data) => { this.articles.set(data); this.loading.set(false); },
      error: () => { this.errorMsg.set('Impossible de charger les articles'); this.loading.set(false); },
    });
  }

  openCreate(): void {
    this.editingArticle.set(null);
    this.form.reset({
      title: '', slug: '', excerpt: '', content: '', cover_image: '',
      author: 'Roger Bass', sort_order: 0, is_published: false,
    });
    this.imagePreview.set(null);
    this.showForm.set(true);
  }

  openEdit(article: Article): void {
    this.editingArticle.set(article);
    this.form.patchValue({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      cover_image: article.cover_image,
      author: article.author,
      sort_order: article.sort_order,
      is_published: article.is_published,
    });
    this.imagePreview.set(article.cover_image ? this.sanitizer.bypassSecurityTrustUrl(article.cover_image) : null);
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
    this.editingArticle.set(null);
    this.imagePreview.set(null);
  }

  onCoverSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(this.sanitizer.bypassSecurityTrustUrl(reader.result as string));
    reader.readAsDataURL(file);

    this.uploading.set(true);
    this.errorMsg.set('');
    this.api.uploadImage(file).subscribe({
      next: (res) => {
        this.form.patchValue({ cover_image: res.url });
        this.uploading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(extractApiError(err, 'Erreur lors de l\'upload de l\'image'));
        this.uploading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid || this.uploading()) return;
    this.saving.set(true);
    this.errorMsg.set('');
    const data = this.form.getRawValue();
    const editing = this.editingArticle();
    const req = editing
      ? this.api.adminUpdateArticle(editing.ID, data)
      : this.api.adminCreateArticle(data);

    req.subscribe({
      next: () => {
        this.successMsg.set(editing ? 'Enseignement mis à jour !' : 'Enseignement publié !');
        this.showForm.set(false);
        this.imagePreview.set(null);
        this.load();
        this.saving.set(false);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(extractApiError(err, 'Erreur lors de la sauvegarde'));
        this.saving.set(false);
      },
    });
  }

  delete(article: Article): void {
    if (!confirm(`Supprimer « ${article.title} » ?`)) return;
    this.api.adminDeleteArticle(article.ID).subscribe({
      next: () => this.load(),
      error: () => this.errorMsg.set('Erreur lors de la suppression'),
    });
  }
}
