import { Component, OnInit, OnDestroy } from '@angular/core';
import { IngestionService, Ingestion } from '../ingestion.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../shared/components/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-ingestion-list',
  templateUrl: './ingestion-list.component.html',
  styleUrls: ['./ingestion-list.component.scss']
})
export class IngestionListComponent implements OnInit, OnDestroy {
  ingestions: Ingestion[] = [];
  displayedColumns: string[] = ['sourceType', 'status', 'actions'];

  private subscriptions = new Subscription();

  constructor(
    private ingestionService: IngestionService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadIngestions();
  }

  loadIngestions(): void {
    const sub = this.ingestionService.getIngestions().subscribe({
      next: (data) => this.ingestions = data,
      error: () => this.snackBar.open('Failed to load ingestions', 'Close', { duration: 3000 })
    });
    this.subscriptions.add(sub);
  }

  editIngestion(ingestion: Ingestion) {
    this.router.navigate(['dashboard/ingestion/edit', ingestion._id]);
  }

  confirmDelete(ingestion: Ingestion) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '300px',
      data: { name: ingestion.sourceType }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteIngestion(ingestion._id!);
      }
    });
  }

  deleteIngestion(id: string) {
    const sub = this.ingestionService.deleteIngestion(id).subscribe({
      next: () => {
        this.snackBar.open('Ingestion deleted', 'Close', { duration: 3000 });
        this.loadIngestions();
      },
      error: () => this.snackBar.open('Failed to delete ingestion', 'Close', { duration: 3000 })
    });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}