import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/users/users';
import { Vehicles } from './pages/vehicles/vehicles';
import { Missions } from './pages/missions/missions';
import { Documents } from './pages/documents/documents';
import { DriverDocumentDetails } from './pages/documents/driver-document-details';
import { Administration } from './pages/administration/administration';
import { Login } from './auth/login/login';
import { authGuard } from './guards/auth-guard'
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { guestGuard } from './guards/guest-guard';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';

export const routes: Routes = [

  {
    path: '',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'users', component: Users },
      { path: 'vehicles', component: Vehicles },
      { path: 'missions', component: Missions },
      { path: 'documents', component: Documents },
      { path: 'documents/driver/:id', component: DriverDocumentDetails },
      { path: 'administration', component: Administration }
    ]
  },

  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      { path: 'login', component: Login },

      {
        path: 'register',
        loadComponent: () =>
          import('./auth/register/register')
            .then(m => m.Register)
      }
    ]
  },

  { path: '**', redirectTo: 'auth/login' }

];