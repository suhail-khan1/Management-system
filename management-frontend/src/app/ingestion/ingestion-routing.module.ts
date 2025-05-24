import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IngestionListComponent } from './ingestion-list/ingestion-list.component';
import { IngestionEditComponent } from './ingestion-edit/ingestion-edit.component';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: IngestionListComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: IngestionEditComponent, canActivate: [AuthGuard] },
  { path: 'create', component: IngestionEditComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IngestionRoutingModule { }
