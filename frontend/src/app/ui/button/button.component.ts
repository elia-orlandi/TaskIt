import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('submit');
  disabled = input(false);
  loading = input(false);
  text = input('');
  variant = input<'primary' | 'secondary'>('primary');
}