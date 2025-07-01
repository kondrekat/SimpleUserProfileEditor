import { Routes } from '@angular/router';
import { View } from './pages/view/view';
import { Edit } from './pages/edit/edit';

export const routes: Routes = [
  { path: '', redirectTo: '/view', pathMatch: 'full' },

  {
    path: 'view',
    component: View,
  },

  {
    path: 'edit',
    component: Edit,
  },

  { path: '**', redirectTo: '/view' },
];
