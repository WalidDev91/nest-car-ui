import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Drivers } from './pages/drivers/drivers';
import { Vehicles } from './pages/vehicles/vehicles';
import { Missions } from './pages/missions/missions';
import { Documents } from './pages/documents/documents';
import { Administration } from './pages/administration/administration';

export const routes: Routes = [
  { path: '', component: Dashboard },

  { path: 'dashboard', component: Dashboard },
  { path: 'drivers', component: Drivers },
  { path: 'vehicles', component: Vehicles },
  { path: 'missions', component: Missions },
  { path: 'documents', component: Documents },
  { path: 'administration', component: Administration },
];
