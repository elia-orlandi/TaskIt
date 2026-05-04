import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/task/task.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { Category } from '../../core/models/task.models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule, ButtonComponent, ModalComponent],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between mb-lg">
        <div>
          <h1 class="font-display-md text-display-md text-on-background">Categorie</h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Gestisci le tue categorie</p>
        </div>
        <ui-button
          text="Nuova categoria"
          variant="primary"
          (click)="openCreateModal()">
          <span class="material-symbols-outlined">add</span>
        </ui-button>
      </div>

      <!-- Categories List -->
      <div class="flex-1 rounded-xl overflow-hidden flex flex-col min-h-0">
        @if (loading()) {
          <div class="flex items-center justify-center h-full">
            <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          </div>
        } @else if (categories().length === 0) {
          <div class="flex flex-col items-center justify-center h-full">
            <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-sm">folder_open</span>
            <p class="font-body-md text-body-md text-on-surface-variant">Nessuna categoria trovata</p>
          </div>
        } @else {
          <div class="overflow-y-auto flex-1 min-h-0">
            @for (category of categories(); track category.id) {
              <div class="flex items-center justify-between px-md py-md border-t border-surface-variant hover:bg-surface-container-lowest transition-colors">
                <!-- Left: Color dot + Name + Task count -->
                <div class="flex items-center gap-md">
                  <span class="w-4 h-4 rounded-full flex-shrink-0" [style.background]="category.color"></span>
                  <div class="flex flex-col">
                    <span class="font-body-md text-body-md text-on-surface">{{ category.name }}</span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">{{ getTaskCount(category) }} attività</span>
                  </div>
                </div>
                <!-- Right: Edit + Delete -->
                <div class="flex items-center gap-sm">
                  <button
                    (click)="openEditModal(category)"
                    class="p-sm rounded-full hover:bg-surface-container-high transition-colors">
                    <span class="material-symbols-outlined text-on-surface-variant">edit</span>
                  </button>
                  <button
                    (click)="confirmDelete(category)"
                    class="p-sm rounded-full hover:bg-surface-container-high transition-colors">
                    <span class="material-symbols-outlined text-on-surface-variant">delete</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Create/Edit Modal -->
      <ui-modal
        [isOpen]="showModal()"
        [title]="isEditing() ? 'Modifica categoria' : 'Nuova categoria'"
        (onClose)="closeModal()">
        <div class="flex flex-col gap-md">
          <div>
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Nome</label>
            <input
              type="text"
              [(ngModel)]="categoryName"
              placeholder="Inserisci il nome della categoria"
              class="w-full px-md py-sm rounded-lg border border-surface-variant focus:bg-surface-container-lowest focus:border-primary outline-none transition-colors font-body-md text-body-md text-on-surface"
              [class.border-error]="formError()" />
            @if (formError()) {
              <span class="font-label-sm text-label-sm text-error mt-xs block">{{ formError() }}</span>
            }
          </div>

          <div>
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Colore</label>
            <div class="flex flex-wrap gap-sm">
              @for (color of colorOptions; track color) {
                <button
                  type="button"
                  (click)="categoryColor = color"
                  class="w-8 h-8 rounded-full transition-transform"
                  [class.ring-2]="categoryColor === color"
                  [class.ring-primary]="categoryColor === color"
                  [class.ring-offset-2]="categoryColor === color"
                  [style.background]="color">
                </button>
              }
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-sm mt-lg">
          <ui-button text="Annulla" variant="secondary" (click)="closeModal()" />
          <ui-button class="m-0"text="Salva" variant="primary" (click)="saveCategory()" [loading]="saving()" />
        </div>
      </ui-modal>

      <!-- Delete Confirmation Modal -->
      <ui-modal
        [isOpen]="showDeleteConfirm()"
        title="Elimina categoria"
        (onClose)="cancelDelete()">
        <p class="text-on-surface mb-md">
          Sei sicuro di voler eliminare la categoria <strong>"{{ categoryToDelete()?.name }}"</strong>?
        </p>
        <p class="font-body-sm text-body-sm text-on-surface-variant">
          Le attività associate non verranno eliminate, ma diventeranno senza categoria.
        </p>

        <div class="flex justify-end gap-sm mt-lg">
          <ui-button text="Annulla" variant="secondary" (click)="cancelDelete()" />
          <ui-button class="m-0" text="Elimina" variant="primary" (click)="executeDelete()" [loading]="deleting()" />
        </div>
      </ui-modal>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .mb-lg { margin-bottom: 1.5rem; }
    .mb-md { margin-bottom: 1rem; }
    .gap-md { gap: 1rem; }
    .gap-sm { gap: 0.5rem; }
    .mt-lg { margin-top: 1.5rem; }
  `]
})
export class CategoriesComponent implements OnInit {
  private taskService = inject(TaskService);

  categories = this.taskService.categories;
  loading = this.taskService.loading;

  // Modal state
  showModal = signal(false);
  isEditing = signal(false);
  saving = signal(false);
  formError = signal('');

  // Form data
  editingCategory = signal<Category | null>(null);
  categoryName = '';
  categoryColor = '#6366f1';

  // Delete confirmation
  showDeleteConfirm = signal(false);
  deleting = signal(false);
  categoryToDelete = signal<Category | null>(null);

  // Predefined color options
  colorOptions = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
  ];

  ngOnInit() {
    this.taskService.getCategories().subscribe();
  }

  getTaskCount(category: Category): number {
    return (category as any).tasks_count || 0;
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.editingCategory.set(null);
    this.categoryName = '';
    this.categoryColor = '#6366f1';
    this.formError.set('');
    this.showModal.set(true);
  }

  openEditModal(category: Category) {
    this.isEditing.set(true);
    this.editingCategory.set(category);
    this.categoryName = category.name;
    this.categoryColor = category.color;
    this.formError.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCategory.set(null);
  }

  saveCategory() {
    if (!this.categoryName.trim()) {
      this.formError.set('Il nome è obbligatorio');
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    const data = { name: this.categoryName.trim(), color: this.categoryColor };

    const obs = this.isEditing()
      ? this.taskService.updateCategory(this.editingCategory()!.id, data)
      : this.taskService.createCategory(data);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.taskService.getCategories().subscribe();
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(err.error?.message || 'Errore durante il salvataggio');
      }
    });
  }

  confirmDelete(category: Category) {
    this.categoryToDelete.set(category);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.categoryToDelete.set(null);
  }

  executeDelete() {
    const category = this.categoryToDelete();
    if (!category) return;

    this.deleting.set(true);
    this.taskService.deleteCategory(category.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.cancelDelete();
        this.taskService.getCategories().subscribe();
      },
      error: (err) => {
        this.deleting.set(false);
        this.cancelDelete();
      }
    });
  }
}