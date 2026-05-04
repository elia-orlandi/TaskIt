import { Component } from '@angular/core';

@Component({
  selector: 'app-tasks',
  standalone: true,
  template: `
    <div class="flex items-center justify-center h-full">
      <div class="text-center">
        <span class="material-symbols-outlined text-6xl text-on-surface-variant mb-md">construction</span>
        <h1 class="font-display-md text-display-md text-on-background mb-sm">Tasks</h1>
        <p class="font-body-md text-body-md text-on-surface-variant">Presto disponibile</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .mb-md { margin-bottom: 1rem; }
    .mb-sm { margin-bottom: 0.5rem; }
  `]
})
export class TasksComponent {}