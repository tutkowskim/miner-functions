import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

export interface UserPrincipal {
  clientPrincipal: User | null;
}

/**
 * Service for interacting with the built in authentication for Azure Static Web Apps.
 *
 * Documentation:
 * - https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization
 * - https://docs.microsoft.com/en-us/azure/static-web-apps/user-information?tabs=javascript
 * -
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly getCurrentUserUrl: string = '/.auth/me';
  private readonly loginWithGoogleUrl: string = '/.auth/login/google';
  private readonly logoutUrl: string = '/.auth/logout';

  public readonly userPrincipal$: Observable<UserPrincipal>;
  public readonly isAuthenticated$: Observable<boolean>;
  public readonly isPrivilegedUser$: Observable<boolean>;

  constructor(@Inject(DOCUMENT) private document: Document, private http: HttpClient) {
    this.userPrincipal$ = this.http.get<UserPrincipal>(this.getCurrentUserUrl);
    this.isAuthenticated$ = this.userPrincipal$.pipe(map(userPrincipal => !!userPrincipal.clientPrincipal ));
    this.isPrivilegedUser$ = this.userPrincipal$.pipe(map(userPrincipal => userPrincipal.clientPrincipal?.userRoles?.includes('user') || false ));
  }

  public loginWithGoogle(postLoginRedirect: string = '/'): void {
    this.document.location.href = `${this.loginWithGoogleUrl}?post_login_redirect_uri=${postLoginRedirect}`;
  }

  public logout(postLogoutRedirect: string = '/'): void {
    this.document.location.href = `${this.logoutUrl}?post_logout_redirect_uri=${postLogoutRedirect}`;
  }
}