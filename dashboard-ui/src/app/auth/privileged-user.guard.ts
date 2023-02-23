import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs'; 
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PrivilegedUserGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {
  }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    if (!(await firstValueFrom(this.authService.isPrivilegedUser$))) {
      return this.router.parseUrl('/unauthorized');
    }else {
      return true;
    }
  }
}