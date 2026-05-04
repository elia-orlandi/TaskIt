import { Component, input, output, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SelectOption = {
  value: string | number;
  label: string;
  color?: string;
};

@Component({
  selector: 'ui-multi-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative" (click)="onContainerClick($event)">
      <button
        type="button"
        (click)="toggle()"
        class="w-full flex items-center justify-between px-md py-sm rounded-lg border border-surface-variant hover:bg-surface-container-lowest transition-colors">
        <span class="font-body-md text-body-md text-on-surface truncate">
          @if (selected().length === 0) {
            {{ placeholder() }}
          } @else if (selected().length === 1) {
            {{ getLabel(selected()[0]) }}
          } @else {
            {{ selected().length }} selezionati
          }
        </span>
        <span class="material-symbols-outlined text-on-surface-variant">expand_more</span>
      </button>

      @if (isOpen()) {
        <div class="bg-white absolute z-50 top-full left-0 right-0 mt-xs rounded-lg border border-surface-variant shadow-lg max-h-60 overflow-y-auto">
          @for (option of options(); track option.value) {
            <label class="flex items-center gap-sm px-md py-sm hover:bg-surface-container cursor-pointer">
              <input
                type="checkbox"
                [checked]="isSelected(option.value)"
                (change)="toggleOption(option.value)"
                class="w-4 h-4 rounded border-outline accent-primary" />
              @if (option.color) {
                <span class="w-3 h-3 rounded-full shrink-0" [style.background]="option.color"></span>
              }
              <span class="font-body-sm text-body-sm text-on-surface">{{ option.label }}</span>
            </label>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class MultiSelectComponent {
  options = input.required<SelectOption[]>();
  selected = input<string[]>([]);
  placeholder = input('Seleziona...');
  selectionChange = output<string[]>();

  isOpen = signal(false);

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  onContainerClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  isSelected(value: string | number): boolean {
    return this.selected().includes(String(value));
  }

  getLabel(value: string | number): string {
    const strValue = String(value);
    const opt = this.options().find(o => String(o.value) === strValue);
    return opt?.label || strValue;
  }

  toggleOption(value: string | number): void {
    const current = this.selected();
    const strValue = String(value);
    const newSelected = current.includes(strValue)
      ? current.filter(v => v !== strValue)
      : [...current, strValue];
    this.selectionChange.emit(newSelected);
  }
}