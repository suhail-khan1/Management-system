import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DocumentUploadComponent } from './document-upload.component';
import { DocumentService } from '../document.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DocumentUploadComponent', () => {
  let component: DocumentUploadComponent;
  let fixture: ComponentFixture<DocumentUploadComponent>;
  let documentServiceSpy: jasmine.SpyObj<DocumentService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const docSpy = jasmine.createSpyObj('DocumentService', ['uploadDocument']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [DocumentUploadComponent],
      imports: [ReactiveFormsModule, MatSnackBarModule, BrowserAnimationsModule],
      providers: [
        { provide: DocumentService, useValue: docSpy },
        { provide: Router, useValue: rSpy }
      ]
    }).compileComponents();

    documentServiceSpy = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if no file selected on upload', () => {
    spyOn(component['snackBar'], 'open');

    component.fileToUpload = null;
    component.upload();

    expect(component['snackBar'].open).toHaveBeenCalledWith('Please select a file to upload', 'Close', { duration: 3000 });
  });

  it('should upload file and navigate on success', fakeAsync(() => {
    const file = new File([''], 'test.pdf');
    component.fileToUpload = file;

    documentServiceSpy.uploadDocument.and.returnValue(of({ _id: '1', title: 'test.pdf', description: '', url: '' }));
    component.uploading = false;

    component.upload();
    tick(1000);

    expect(documentServiceSpy.uploadDocument).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/documents']);
  }));

  it('should handle upload failure', fakeAsync(() => {
    const file = new File([''], 'test.pdf');
    component.fileToUpload = file;
    spyOn(component['snackBar'], 'open');

    documentServiceSpy.uploadDocument.and.returnValue(throwError(() => new Error('fail')));

    component.upload();
    tick();

    expect(component['snackBar'].open).toHaveBeenCalledWith('Upload failed', 'Close', { duration: 3000 });
    expect(component.uploading).toBeFalse();
  }));

  it('should update fileToUpload on file input change', () => {
    const fakeEvent = {
      target: {
        files: [new File([''], 'mydoc.pdf')]
      }
    } as unknown as Event;

    component.handleFileInput(fakeEvent);
    expect(component.fileToUpload?.name).toBe('mydoc.pdf');
    expect(component.uploadForm.get('file')?.value).toBe(component.fileToUpload);
  });
});