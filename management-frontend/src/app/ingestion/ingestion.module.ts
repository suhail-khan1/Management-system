import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IngestionRoutingModule } from './ingestion-routing.module';
import { IngestionListComponent } from './ingestion-list/ingestion-list.component';
import { IngestionEditComponent } from './ingestion-edit/ingestion-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    IngestionListComponent,
    IngestionEditComponent
  ],
  imports: [
    CommonModule,
    IngestionRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule
  ]
})
export class IngestionModule { }
