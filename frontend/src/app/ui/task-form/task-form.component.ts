import { Component, inject, signal, computed, OnInit, output, input, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../core/task/task.service';
import { ButtonComponent } from '../button/button.component';
import { TextInputComponent } from '../text-input/text-input.component';
import { Task } from '../../core/models/task.models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, TextInputComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-md">
      <!-- Title -->
      <div class="flex flex-col gap-xs">
        <label class="font-label-sm text-label-sm text-on-surface-variant" for="title">Titolo *</label>
        <input
          type="text"
          id="title"
          formControlName="title"
          placeholder="Inserisci il titolo dell'attività"
          class="w-full px-md py-sm rounded-lg border border-surface-variant focus:bg-surface-container-lowest focus:border-primary outline-none transition-colors font-body-md text-body-md text-on-surface" />
        @if (titleError()) {
          <span class="text-error font-label-sm text-label-sm">{{ titleError() }}</span>
        }
      </div>

      <!-- Description -->
      <div class="flex flex-col gap-xs">
        <label class="font-label-sm text-label-sm text-on-surface-variant" for="description">Descrizione</label>
        <textarea
          id="description"
          formControlName="description"
          placeholder="Aggiungi una descrizione (opzionale)"
          rows="3"
          class="w-full px-md py-sm rounded-lg border border-surface-variant focus:bg-surface-container-lowest focus:border-primary outline-none transition-colors font-body-md text-body-md text-on-surface resize-none"></textarea>
      </div>

      <!-- Category -->
      <div class="flex flex-col gap-xs">
        <label class="font-label-sm text-label-sm text-on-surface-variant" for="category">Categoria</label>
        <select
          id="category"
          formControlName="category_id"
          class="w-full px-md py-sm rounded-lg border border-surface-variant focus:bg-surface-container-lowest focus:border-primary outline-none transition-colors font-body-md text-body-md text-on-surface">
          <option value="">Nessuna categoria</option>
          @for (cat of categories(); track cat.id) {
            <option [value]="cat.id">{{ cat.name }}</option>
          }
        </select>
      </div>

      <!-- Priority -->
      <div class="flex flex-col gap-xs">
        <label class="font-label-sm text-label-sm text-on-surface-variant" for="priority">Priorità *</label>
        <select
          id="priority"
          formControlName="priority"
          class="w-full px-md py-sm rounded-lg border border-surface-variant focus:bg-surface-container-lowest focus:border-primary outline-none transition-colors font-body-md text-body-md text-on-surface">
          <option value="low">Bassa</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </div>

      <!-- Due Date -->
      <div class="flex flex-col gap-xs">
        <label class="font-label-sm text-label-sm text-on-surface-variant" for="due_date">Data di scadenza</label>
        <input
          type="date"
          id="due_date"
          formControlName="due_date"
          class="w-full px-md py-sm rounded-lg border border-surface-variant focus:bg-surface-container-lowest focus:border-primary outline-none transition-colors font-body-md text-body-md text-on-surface" />
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-sm pt-md border-t border-surface-variant">
        <ui-button
          variant="secondary"
          text="Annulla"
          type="button"
          (click)="cancel.emit()" />
        <ui-button
          variant="primary"
          [text]="isEditing ? 'Salva modifiche' : 'Crea attività'"
          type="submit"
          class="m-0"
          [loading]="loading()" />
      </div>
    </form>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);

  editingTask = input<Task | null>(null);
  cancel = output<void>();

  categories = this.taskService.categories;
  loading = this.taskService.loading;

  get isEditing(): boolean {
    return this.editingTask() !== null;
  }

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    category_id: [''],
    priority: ['medium', Validators.required],
    due_date: ['']
  });

  private titleControl = this.form.get('title')!;

  titleError = computed(() => {
    if (this.titleControl.touched && this.titleControl.hasError('required')) {
      return 'Il titolo è obbligatorio';
    }
    return null;
  });

  constructor() {
    effect(() => {
      const task = this.editingTask();
      if (task) {
        this.form.patchValue({
          title: task.title,
          description: task.description || '',
          category_id: task.category_id?.toString() || '',
          priority: task.priority,
          due_date: task.due_date ? this.formatDateForInput(task.due_date) : ''
        });
      } else {
        this.form.reset({ priority: 'medium' });
      }
    });
  }

  private formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.taskService.getCategories().subscribe();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const taskData: any = {
      title: formValue.title,
      description: formValue.description || undefined,
      category_id: formValue.category_id ? Number(formValue.category_id) : undefined,
      priority: formValue.priority,
      due_date: formValue.due_date || undefined
    };

    const task = this.editingTask();
    const obs = task
      ? this.taskService.updateTask(task.id, taskData)
      : this.taskService.createTask(taskData);

    obs.subscribe({
      next: () => {
        this.form.reset({ priority: 'medium' });
        this.cancel.emit();
      }
    });
  }
}