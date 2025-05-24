import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { DocumentService } from '../document.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent implements OnDestroy {
  uploadForm = this.fb.group({
    file: new FormControl<File | null>(null)
  });

  fileToUpload: File | null = null;
  private subscriptions = new Subscription();
  uploading = false;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.fileToUpload = input.files[0];
      this.uploadForm.patchValue({ file: this.fileToUpload });
    }
  }

  upload(): void {
    if (!this.fileToUpload) {
      this.snackBar.open('Please select a file to upload', 'Close', { duration: 3000 });
      return;
    }

    this.uploading = true;
    const formData = new FormData();
    formData.append('file', this.fileToUpload, this.fileToUpload.name);

    const sub = this.documentService.uploadDocument(formData).subscribe({
      next: () => {
        this.snackBar.open('Upload successful', 'Close', { duration: 3000 });
        this.router.navigate(['/documents']);
      },
      error: () => {
        this.snackBar.open('Upload failed', 'Close', { duration: 3000 });
        this.uploading = false;
      }
    });

    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}