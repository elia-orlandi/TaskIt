import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-md">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          (click)="onClose.emit()">
        </div>
        
        <!-- Modal -->
        <div class="relative bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-[420px] max-h-[90vh] flex flex-col animate-modal-appear">
          <!-- Header -->
          <div class="flex items-center justify-between px-lg py-md border-b border-surface-variant">
            <h2 class="font-display-sm text-display-sm text-on-background">{{ title() }}</h2>
            <button 
              type="button"
              (click)="onClose.emit()"
              class="p-sm rounded-full hover:bg-surface-container transition-colors">
              <span class="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>
          
          <!-- Content -->
          <div class="flex-1 overflow-y-auto px-lg py-md">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    @keyframes modal-appear {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-modal-appear {
      animation: modal-appear 200ms ease-out;
    }
  `]
})
export class ModalComponent {
  isOpen = input(false);
  title = input('');
  onClose = output<void>();
}