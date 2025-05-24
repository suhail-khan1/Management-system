import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IngestionService, Ingestion } from '../ingestion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ingestion-edit',
  templateUrl: './ingestion-edit.component.html',
  styleUrls: ['./ingestion-edit.component.scss']
})
export class IngestionEditComponent implements OnInit, OnDestroy {
  ingestionForm!: FormGroup;
  ingestionId?: string;
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ingestionService: IngestionService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.route && this.route.snapshot) {
      this.ingestionId = this.route.snapshot.paramMap.get('id') ?? undefined;
    }
    this.ingestionForm = this.fb.group({
      sourceType: ['', Validators.required],
      status: ['', Validators.required]
    });

    if (this.ingestionId) {
      const sub = this.ingestionService.getIngestion(this.ingestionId).subscribe({
        next: (ingestion) => this.ingestionForm.patchValue(ingestion),
        error: () => this.snackBar.open('Failed to load ingestion', 'Close', { duration: 3000 })
      });
      this.subscriptions.add(sub);
    }
  }

  save(): void {
    if (this.ingestionForm.valid) {
      const ingestion: Ingestion = {
        ...this.ingestionForm.value,
        _id: this.ingestionId
      };

      let saveObs = this.ingestionId
        ? this.ingestionService.updateIngestion(ingestion)
        : this.ingestionService.createIngestion(ingestion);

      const sub = saveObs.subscribe({
        next: () => {
          this.snackBar.open('Ingestion saved successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['dashboard/ingestion']);
        },
        error: () => this.snackBar.open('Failed to save ingestion', 'Close', { duration: 3000 })
      });
      this.subscriptions.add(sub);
    }
  }

  cancel(): void {
    this.router.navigate(['dashboard/ingestion']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}