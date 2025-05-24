import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { ConfirmDeleteDialogComponent } from './components/confirm-delete-dialog/confirm-delete-dialog.component';


@NgModule({
  declarations: [
    ConfirmDeleteDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [MaterialModule, ConfirmDeleteDialogComponent]
})
export class SharedModule { }
