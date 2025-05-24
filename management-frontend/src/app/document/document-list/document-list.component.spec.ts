import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DocumentListComponent } from './document-list.component';
import { DocumentService, Document } from '../document.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DocumentListComponent', () => {
  let component: DocumentListComponent;
  let fixture: ComponentFixture<DocumentListComponent>;
  let documentServiceSpy: jasmine.SpyObj<DocumentService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DocumentService', ['getDocuments', 'deleteDocument']);

    await TestBed.configureTestingModule({
      declarations: [DocumentListComponent],
      imports: [
        MatSnackBarModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        BrowserAnimationsModule
      ],
      providers: [{ provide: DocumentService, useValue: spy }]
    }).compileComponents();

    documentServiceSpy = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentListComponent);
    component = fixture.componentInstance;
  });

  it('should load documents on init', () => {
    const dummyDocs: Document[] = [
      { _id: '1', title: 'Doc1', description: 'Doc1', url: 'url1' }
    ];
    documentServiceSpy.getDocuments.and.returnValue(of(dummyDocs));

    fixture.detectChanges();

    expect(component.dataSource.data.length).toBe(1);
    expect(documentServiceSpy.getDocuments).toHaveBeenCalled();
  });

  it('should show error on load failure', () => {
    documentServiceSpy.getDocuments.and.returnValue(throwError(() => new Error('error')));
    spyOn(component['snackBar'], 'open');

    fixture.detectChanges();

    expect(component['snackBar'].open).toHaveBeenCalledWith('Failed to load documents', 'Close', { duration: 3000 });
  });

  it('should delete document when confirmed', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    documentServiceSpy.deleteDocument.and.returnValue(of(void 0));
    documentServiceSpy.getDocuments.and.returnValue(of([]));
    spyOn(component, 'loadDocuments').and.callThrough();
    spyOn(component['snackBar'], 'open');

    fixture.detectChanges();

    component.deleteDocument('1');
    tick();

    expect(documentServiceSpy.deleteDocument).toHaveBeenCalledWith('1');
    expect(component['snackBar'].open).toHaveBeenCalledWith('Document deleted', 'Close', { duration: 3000 });
    expect(component.loadDocuments).toHaveBeenCalled();
  }));

  it('should not delete document if confirmation denied', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    documentServiceSpy.deleteDocument.and.returnValue(of(void 0));
    fixture.detectChanges();

    component.deleteDocument('1');

    expect(documentServiceSpy.deleteDocument).not.toHaveBeenCalled();
  });
});
