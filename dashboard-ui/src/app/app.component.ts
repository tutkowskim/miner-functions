import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public readonly isPrivilegedUser$;
  
  constructor(private authService: AuthService, private router: Router) {
    this.isPrivilegedUser$ = this.authService.isPrivilegedUser$;
  }

  public navigate(url: string) {
    this.router.navigateByUrl(url);
  }

  public logout() {
    this.authService.logout();
  }
}
