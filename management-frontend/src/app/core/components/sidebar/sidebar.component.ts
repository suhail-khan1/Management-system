import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  constructor(private router: Router) { }

  logout(): void {
    if (sessionStorage.getItem('token')) {
      sessionStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }
}
