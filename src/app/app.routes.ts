import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/users/users';
import { UserDetails } from './pages/users/user-details';

import { Vehicles } from './pages/vehicles/vehicles';
import { VehicleDetails } from './pages/vehicles/vehicle-details';

import { Drivers } from './pages/drivers/drivers';

import { Missions } from './pages/missions/missions';
import { MissionDetails } from './pages/missions/mission-details';

import { Documents } from './pages/documents/documents';

import { Profile } from './pages/profile/profile';

import { Administration } from './pages/administration/administration';

import { Login } from './auth/login/login';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { ResetPassword } from './auth/reset-password/reset-password';

import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { roleGuard } from './guards/role-guard';

import { AuthLayout } from './layout/auth-layout/auth-layout';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';

export const routes: Routes = [

  // =========================================================
  // DASHBOARD APPLICATION
  // =========================================================

  {
    path: '',
    component: DashboardLayout,
    canActivate: [authGuard],

    children: [

      // -------------------------------------------------------
      // DEFAULT
      // -------------------------------------------------------

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // -------------------------------------------------------
      // DASHBOARD
      // All authenticated roles
      // -------------------------------------------------------

      {
        path: 'dashboard',
        component: Dashboard
      },

      // -------------------------------------------------------
      // USERS
      // Super Admin + Admin
      // -------------------------------------------------------

      {
        path: 'users',
        component: Users,
        canActivate: [roleGuard],
        data: {
          roles: ['SUPER_ADMIN', 'ADMIN']
        }
      },

      {
        path: 'users/:id',
        component: UserDetails,
        canActivate: [roleGuard],
        data: {
          roles: ['SUPER_ADMIN', 'ADMIN']
        }
      },

      // -------------------------------------------------------
      // VEHICLES
      // All roles
      // Driver view will be personalized later
      // -------------------------------------------------------

      {
        path: 'vehicles',
        component: Vehicles,
        canActivate: [roleGuard],
        data: {
          roles: [
            'SUPER_ADMIN',
            'ADMIN',
            'FLEET_MANAGER',
            'DRIVER'
          ]
        }
      },

      {
        path: 'vehicles/:id',
        component: VehicleDetails,
        canActivate: [roleGuard],
        data: {
          roles: [
            'SUPER_ADMIN',
            'ADMIN',
            'FLEET_MANAGER',
            'DRIVER'
          ]
        }
      },

      // -------------------------------------------------------
      // MISSIONS
      // All roles
      // Driver view will be personalized later
      // -------------------------------------------------------

      {
        path: 'missions',
        component: Missions,
        canActivate: [roleGuard],
        data: {
          roles: [
            'SUPER_ADMIN',
            'ADMIN',
            'FLEET_MANAGER',
            'DRIVER'
          ]
        }
      },

      {
        path: 'missions/:id',
        component: MissionDetails,
        canActivate: [roleGuard],
        data: {
          roles: [
            'SUPER_ADMIN',
            'ADMIN',
            'FLEET_MANAGER',
            'DRIVER'
          ]
        }
      },

      // -------------------------------------------------------
      // DRIVERS
      // Super Admin + Admin + Fleet Manager
      // -------------------------------------------------------

      {
        path: 'drivers',
        component: Drivers,
        canActivate: [roleGuard],
        data: {
          roles: [
            'SUPER_ADMIN',
            'ADMIN',
            'FLEET_MANAGER'
          ]
        }
      },

      // -------------------------------------------------------
      // PROFILE
      // All authenticated roles
      // -------------------------------------------------------

      {
        path: 'profile',
        component: Profile
      },

      // -------------------------------------------------------
      // DOCUMENTS
      // All roles
      // -------------------------------------------------------

      {
        path: 'documents',
        component: Documents,
        canActivate: [roleGuard],
        data: {
          roles: [
            'SUPER_ADMIN',
            'ADMIN',
            'FLEET_MANAGER',
            'DRIVER'
          ]
        }
      },

      /*
      {
        path: 'documents/driver/:id',
        component: DriverDocumentDetails
      },

      {
        path: 'documents/vehicle/:id',
        component: VehicleDocumentDetails
      },

      {
        path: 'documents/mission/:id',
        component: MissionDocumentDetails
      },
      */

      // -------------------------------------------------------
      // ADMINISTRATION
      // Super Admin + Admin + Fleet Manager
      // -------------------------------------------------------

      {
        path: 'administration',
        component: Administration,
        canActivate: [roleGuard],
        data: {
          roles: [
            'SUPER_ADMIN',
            'ADMIN',
            'FLEET_MANAGER'
          ]
        }
      }

    ]
  },

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [guestGuard],

    children: [

      // -------------------------------------------------------
      // LOGIN
      // -------------------------------------------------------

      {
        path: 'login',
        component: Login
      },

      // -------------------------------------------------------
      // FORGOT PASSWORD
      // -------------------------------------------------------

      {
        path: 'forgot-password',
        component: ForgotPassword
      },

      // -------------------------------------------------------
      // RESET PASSWORD
      // -------------------------------------------------------

      {
        path: 'reset-password',
        component: ResetPassword
      },

      // -------------------------------------------------------
      // REGISTER
      // -------------------------------------------------------

      {
        path: 'register',
        loadComponent: () =>
          import('./auth/register/register')
            .then(m => m.Register)
      }

    ]
  },

  // =========================================================
  // UNKNOWN ROUTES
  // =========================================================

  {
    path: '**',
    redirectTo: 'auth/login'
  }

];