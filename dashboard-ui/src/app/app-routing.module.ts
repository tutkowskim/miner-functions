import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { PrivilegedUserGuard } from './auth/privileged-user.guard';
import { LoginComponent } from './login/login.component';
import { MiningComponent } from './mining/mining.component';
import { TransfersComponent } from './transfers/transfers.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

const routes: Routes = [
  { path: 'mining', component: MiningComponent, canActivate: [PrivilegedUserGuard] },
  { path: 'transfers', component: TransfersComponent, canActivate: [PrivilegedUserGuard] },
  { path: 'unauthorized', component: UnauthorizedComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/mining' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
