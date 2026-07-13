import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/users/users';
import { UserDetails } from './pages/users/user-details';
import { Vehicles } from './pages/vehicles/vehicles';
import { VehicleDetails } from './pages/vehicles/vehicle-details';
import { Missions } from './pages/missions/missions';
import { Documents } from './pages/documents/documents';
import { DriverDocumentDetails } from './pages/documents/driver-document-details';
import { VehicleDocumentDetails } from './pages/documents/vehicle-document-details';
import { MissionDocumentDetails } from './pages/documents/mission-document-details';
import { Administration } from './pages/administration/administration';
import { Login } from './auth/login/login';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { ResetPassword } from './auth/reset-password/reset-password';
import { authGuard } from './guards/auth-guard'
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { guestGuard } from './guards/guest-guard';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { MissionDetails } from './pages/missions/mission-details';

export const routes: Routes = [

  {
    path: '',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: Dashboard },

      { path: 'users', component: Users },
      { path: 'users/:id', component: UserDetails },

      { path: 'vehicles', component: Vehicles },
      { path: 'vehicles/:id', component: VehicleDetails },

      { path: 'missions', component: Missions },
      { path: 'missions/:id', component: MissionDetails },

      { path: 'documents', component: Documents },
      { path: 'documents/driver/:id', component: DriverDocumentDetails },
      { path: 'documents/vehicle/:id', component: VehicleDocumentDetails },
      { path: 'documents/mission/:id', component: MissionDocumentDetails },

      { path: 'administration', component: Administration }
    ]
  },

  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [

      { path: 'login', component: Login },

      { path: 'forgot-password', component: ForgotPassword },

      { path: 'reset-password', component: ResetPassword },

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