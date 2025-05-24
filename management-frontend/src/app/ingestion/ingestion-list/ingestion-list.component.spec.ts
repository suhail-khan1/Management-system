import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IngestionListComponent } from './ingestion-list.component';
import { IngestionService, Ingestion } from '../ingestion.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { MatTableModule } from '@angular/material/table';

describe('IngestionListComponent', () => {
  let component: IngestionListComponent;
  let fixture: ComponentFixture<IngestionListComponent>;
  let ingestionServiceSpy: jasmine.SpyObj<IngestionService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const ingestionServiceMock = jasmine.createSpyObj('IngestionService', ['getIngestions', 'deleteIngestion']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
    const dialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [IngestionListComponent],
      imports: [MatTableModule],
      providers: [
        { provide: IngestionService, useValue: ingestionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    }).compileComponents();

    ingestionServiceSpy = TestBed.inject(IngestionService) as jasmine.SpyObj<IngestionService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    // Default dialog afterClosed returns observable of true
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(true)
    } as MatDialogRef<any>);

    fixture = TestBed.createComponent(IngestionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load ingestions on init', () => {
    const mockIngestions: Ingestion[] = [
      { _id: '1', sourceType: 'API', status: 'pending' },
      { _id: '2', sourceType: 'File', status: 'pending' }
    ];
    ingestionServiceSpy.getIngestions.and.returnValue(of(mockIngestions));

    fixture.detectChanges(); // triggers ngOnInit

    expect(ingestionServiceSpy.getIngestions).toHaveBeenCalled();
    expect(component.ingestions).toEqual(mockIngestions);
  });

  it('should show snackbar on load ingestions failure', () => {
    ingestionServiceSpy.getIngestions.and.returnValue(throwError(() => new Error('Error')));
    fixture.detectChanges();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to load ingestions', 'Close', { duration: 3000 });
  });

  it('should navigate to edit page on editIngestion call', () => {
    const ingestion: Ingestion = { _id: '1', sourceType: 'API', status: 'pending' };
    component.editIngestion(ingestion);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['dashboard/ingestion/edit', '1']);
  });

  it('should open confirm delete dialog on confirmDelete call', fakeAsync(() => {
    const ingestion: Ingestion = { _id: '1', sourceType: 'API', status: 'pending' };

    dialogSpy.open.and.returnValue({
      afterClosed: () => of(true)
    } as MatDialogRef<any>);

    ingestionServiceSpy.deleteIngestion.and.returnValue(of());
    ingestionServiceSpy.getIngestions.and.returnValue(of([]));

    component.confirmDelete(ingestion);
    tick();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(ingestionServiceSpy.deleteIngestion).toHaveBeenCalledWith('1');
  }));

  it('should not delete ingestion if dialog cancelled', fakeAsync(() => {
    const ingestion: Ingestion = { _id: '1', sourceType: 'API', status: 'pending' };

    dialogSpy.open.and.returnValue({
      afterClosed: () => of(false)
    } as MatDialogRef<any>);

    component.confirmDelete(ingestion);
    tick();

    expect(ingestionServiceSpy.deleteIngestion).not.toHaveBeenCalled();
  }));

  it('should show snackbar on delete failure', fakeAsync(() => {
    const ingestion: Ingestion = { _id: '1', sourceType: 'API', status: 'pending' };

    dialogSpy.open.and.returnValue({
      afterClosed: () => of(true)
    } as MatDialogRef<any>);

    ingestionServiceSpy.deleteIngestion.and.returnValue(throwError(() => new Error('Delete error')));
    component.confirmDelete(ingestion);
    tick();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to delete ingestion', 'Close', { duration: 3000 });
  }));

  it('should unsubscribe on destroy', () => {
    spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
  });
});
