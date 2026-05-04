import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(routerState);

    if (routeTitle) {
      this.title.setTitle(`TaskIt - ${routeTitle}`);
    } else {
      this.title.setTitle('TaskIt');
    }
  }
}