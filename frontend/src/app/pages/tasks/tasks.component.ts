import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/task/task.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { MultiSelectComponent, SelectOption } from '../../ui/multi-select/multi-select.component';
import { TextInputComponent } from '../../ui/text-input/text-input.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { TaskFormComponent } from '../../ui/task-form/task-form.component';
import { Task, Category, TasksFilters, TasksResponse, Priority } from '../../core/models/task.models';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [FormsModule, ButtonComponent, MultiSelectComponent, TextInputComponent, ModalComponent, TaskFormComponent],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between mb-lg">
        <div>
          <h1 class="font-display-md text-display-md text-on-background">Attività</h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Gestisci le tue attività</p>
        </div>
        <ui-button
          text="Nuova attività"
          variant="primary"
          (click)="openCreateModal()">
          <span class="material-symbols-outlined">add</span>
        </ui-button>
      </div>

      <!-- Filters -->
      <div class="bg-surface-container-low rounded-xl p-md mb-md">
        <div class="flex flex-wrap gap-md items-end">
          <!-- Search by name -->
          <div class="flex-1 min-w-[200px]">
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Nome attività</label>
            <input
              type="text"
              [(ngModel)]="searchText"
              (ngModelChange)="onSearchChange()"
              placeholder="Cerca per nome..."
              class="w-full px-md py-sm rounded-lg border border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary outline-none transition-colors font-body-md text-body-md text-on-surface" />
          </div>

          <!-- State Multi-Select -->
          <div class="min-w-[150px]">
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Stato</label>
            <ui-multi-select
              [options]="statusOptions"
              [selected]="selectedStatuses"
              placeholder="Tutti gli stati"
              (selectionChange)="onStatusChange($event)" />
          </div>

          <!-- Priority Multi-Select -->
          <div class="min-w-[150px]">
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Priorità</label>
            <ui-multi-select
              [options]="priorityOptions"
              [selected]="selectedPriorities"
              placeholder="Tutte le priorità"
              (selectionChange)="onPriorityChange($event)" />
          </div>

          <!-- Category Multi-Select -->
          <div class="min-w-[150px]">
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Categoria</label>
            <ui-multi-select
              [options]="categoryOptions()"
              [selected]="selectedCategories"
              placeholder="Tutte le categorie"
              (selectionChange)="onCategoryChange($event)" />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 bg-surface-container-low rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-surface-container-high">
              <tr>
                <th class="px-md py-sm text-left font-label-sm text-label-sm text-on-surface-variant w-12">
                  <input type="checkbox" class="w-4 h-4 rounded border-outline accent-primary" />
                </th>
                <th class="px-md py-sm text-left font-label-sm text-label-sm text-on-surface-variant">Attività</th>
                <th class="px-md py-sm text-left font-label-sm text-label-sm text-on-surface-variant">Categoria</th>
                <th class="px-md py-sm text-left font-label-sm text-label-sm text-on-surface-variant">Priorità</th>
                <th class="px-md py-sm text-left font-label-sm text-label-sm text-on-surface-variant">Scadenza</th>
                <th class="px-md py-sm text-left font-label-sm text-label-sm text-on-surface-variant">Stato</th>
                <th class="px-md py-sm text-left font-label-sm text-label-sm text-on-surface-variant w-24">Azioni</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr>
                  <td colspan="7" class="px-md py-lg text-center">
                    <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                  </td>
                </tr>
              } @else if (tasks().length === 0) {
                <tr>
                  <td colspan="7" class="px-md py-lg text-center">
                    <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-sm">task_alt</span>
                    <p class="font-body-md text-body-md text-on-surface-variant">Nessuna attività trovata</p>
                  </td>
                </tr>
              } @else {
                @for (task of tasks(); track task.id) {
                  <tr class="border-t border-surface-variant hover:bg-surface-container-lowest transition-colors">
                    <td class="px-md py-sm">
                      <input
                        type="checkbox"
                        [checked]="!!task.completed_at"
                        (change)="toggleTaskComplete(task)"
                        class="w-4 h-4 rounded border-outline accent-primary" />
                    </td>
                    <td class="px-md py-sm">
                      <div class="flex flex-col">
                        <span class="font-body-md text-body-md text-on-surface" [class.line-through]="task.completed_at">
                          {{ task.title }}
                        </span>
                        @if (task.description) {
                          <span class="font-body-sm text-body-sm text-on-surface-variant truncate">
                            {{ task.description }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="px-md py-sm">
                      @if (task.category) {
                        <span class="inline-flex items-center gap-xs px-sm py-xs rounded-full text-label-sm font-label-sm" [style.background]="task.category.color + '20'" [style.color]="task.category.color">
                          {{ task.category.name }}
                        </span>
                      } @else {
                        <span class="font-body-sm text-body-sm text-on-surface-variant">-</span>
                      }
                    </td>
                    <td class="px-md py-sm">
                      <span class="inline-flex items-center gap-xs px-sm py-xs rounded-full text-label-sm font-label-sm" [class]="getPriorityClass(task.priority)">
                        {{ getPriorityLabel(task.priority) }}
                      </span>
                    </td>
                    <td class="px-md py-sm">
                      @if (task.due_date) {
                        <span class="font-body-sm text-body-sm text-on-surface" [class.text-error]="isOverdue(task.due_date)">
                          {{ formatDate(task.due_date) }}
                        </span>
                      } @else {
                        <span class="font-body-sm text-body-sm text-on-surface-variant">-</span>
                      }
                    </td>
                    <td class="px-md py-sm">
                      @if (task.completed_at) {
                        <span class="inline-flex items-center gap-xs text-label-sm font-label-sm text-success">
                          <span class="material-symbols-outlined !text-lg">check_circle</span>
                          Completata
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-xs text-label-sm font-label-sm text-on-surface-variant">
                          <span class="material-symbols-outlined !text-lg">radio_button_unchecked</span>
                          In sospeso
                        </span>
                      }
                    </td>
                    <td class="px-md py-sm">
                      <div class="flex items-center gap-xs">
                        <button
                          (click)="openEditModal(task)"
                          class="p-sm rounded-full hover:bg-surface-container-high transition-colors">
                          <span class="material-symbols-outlined text-on-surface-variant">edit</span>
                        </button>
                        <button
                          (click)="confirmDelete(task)"
                          class="p-sm rounded-full hover:bg-surface-container-high transition-colors">
                          <span class="material-symbols-outlined text-on-surface-variant">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-between mt-md px-md">
          <span class="font-body-sm text-body-sm text-on-surface-variant">
            Pagina {{ currentPage }} di {{ totalPages() }}
          </span>
          <div class="flex gap-xs">
            <ui-button
              variant="secondary"
              [disabled]="currentPage() === 1"
              (click)="goToPage(currentPage() - 1)">
              <span class="material-symbols-outlined">chevron_left</span>
            </ui-button>
            @for (page of visiblePages(); track page) {
              <ui-button
                [variant]="page === currentPage() ? 'primary' : 'secondary'"
                (click)="goToPage(page)">
                {{ page }}
              </ui-button>
            }
            <ui-button
              variant="secondary"
              [disabled]="currentPage() === totalPages()"
              (click)="goToPage(currentPage() + 1)">
              <span class="material-symbols-outlined">chevron_right</span>
            </ui-button>
          </div>
        </div>
      }

      <!-- Create Task Modal -->
      <ui-modal
        [isOpen]="showModal()"
        [title]="isEditing() ? 'Modifica attività' : 'Nuova attività'"
        (onClose)="closeModal()">
        <app-task-form [editingTask]="editingTask()" (cancel)="closeModal()" />
      </ui-modal>

      <!-- Delete Confirmation Modal -->
      <ui-modal
        [isOpen]="showDeleteConfirm()"
        title="Elimina attività"
        (onClose)="cancelDelete()">
        <p class="text-on-surface mb-md">
          Sei sicuro di voler eliminare l'attività <strong>"{{ taskToDelete()?.title }}"</strong>?
        </p>
        <p class="font-body-sm text-body-sm text-on-surface-variant mb-md">
          Questa azione non può essere annullata.
        </p>
        <div class="flex justify-end gap-sm">
          <ui-button text="Annulla" variant="secondary" (click)="cancelDelete()" />
          <ui-button text="Elimina" variant="primary" (click)="executeDelete()" [loading]="deleting()" />
        </div>
      </ui-modal>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    table { border-collapse: collapse; }
  `]
})
export class TasksComponent implements OnInit {
  private taskService = inject(TaskService);

  // Modal state
  showModal = signal(false);
  isEditing = signal(false);
  editingTask = signal<Task | null>(null);

  // Delete confirmation
  showDeleteConfirm = signal(false);
  deleting = signal(false);
  taskToDelete = signal<Task | null>(null);

  // Filters
  searchText = '';
  selectedStatuses: string[] = [];
  selectedPriorities: string[] = [];
  selectedCategories: string[] = [];

  // Options for multi-selects
  statusOptions: SelectOption[] = [
    { value: 'pending', label: 'In sospeso' },
    { value: 'completed', label: 'Completata' }
  ];

  priorityOptions: SelectOption[] = [
    { value: 'low', label: 'Bassa', color: '#4CAF50' },
    { value: 'medium', label: 'Media', color: '#FF9800' },
    { value: 'high', label: 'Alta', color: '#F44336' }
  ];

  categoryOptions = computed<SelectOption[]>(() => {
    return this.taskService.categories().map(c => ({ 
      value: c.id, 
      label: c.name,
      color: c.color 
    }));
  });

  // Data
  tasks = signal<Task[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const delta = 2;
    
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadTasks();
  }

  loadCategories(): void {
    this.taskService.getCategories().subscribe();
  }

  loadTasks(): void {
    this.loading.set(true);
    
    const filters: TasksFilters = {
      search: this.searchText || undefined,
      category_id: this.selectedCategories.map(id => Number(id)),
      priority: this.selectedPriorities as Priority[],
      completed: this.getCompletedFilter(),
      page: this.currentPage(),
      per_page: 10
    };

    this.taskService.getTasks(filters).subscribe({
      next: (response) => {
        this.tasks.set(response.data);
        this.totalPages.set(response.last_page);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getCompletedFilter(): boolean | null {
    if (this.selectedStatuses.length === 0) return null;
    if (this.selectedStatuses.includes('completed') && !this.selectedStatuses.includes('pending')) return true;
    if (this.selectedStatuses.includes('pending') && !this.selectedStatuses.includes('completed')) return false;
    return null;
  }

  onSearchChange(): void {
    this.currentPage.set(1);
    this.loadTasks();
  }

  onStatusChange(selected: string[]): void {
    this.selectedStatuses = selected;
    this.currentPage.set(1);
    this.loadTasks();
  }

  onPriorityChange(selected: string[]): void {
    this.selectedPriorities = selected;
    this.currentPage.set(1);
    this.loadTasks();
  }

  onCategoryChange(selected: string[]): void {
    this.selectedCategories = selected;
    this.currentPage.set(1);
    this.loadTasks();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadTasks();
  }

  toggleTaskComplete(task: Task): void {
    this.taskService.toggleComplete(task.id).subscribe({
      next: (response) => {
        const updatedTask = response.data;
        this.tasks.update(tasks => 
          tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t)
        );
      }
    });
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-error-container/30 text-error';
      case 'medium': return 'bg-tertiary-container/30 text-tertiary';
      case 'low': return 'bg-secondary-container/30 text-secondary';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Bassa';
      default: return priority;
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  isOverdue(dateStr: string): boolean {
    const dueDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingTask.set(null);
    this.showModal.set(true);
  }

  openEditModal(task: Task): void {
    this.isEditing.set(true);
    this.editingTask.set(task);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTask.set(null);
  }

  confirmDelete(task: Task): void {
    this.taskToDelete.set(task);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.taskToDelete.set(null);
  }

  executeDelete(): void {
    const task = this.taskToDelete();
    if (!task) return;

    this.deleting.set(true);
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.cancelDelete();
        this.loadTasks();
      },
      error: () => {
        this.deleting.set(false);
        this.cancelDelete();
      }
    });
  }
}