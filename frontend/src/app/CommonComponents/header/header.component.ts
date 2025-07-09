import { Component } from '@angular/core';

@Component({
  selector: 'header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  loggedInUsername: string | null = '';

  constructor() {
    this.loggedInUsername = localStorage.getItem('username');
  }
}
