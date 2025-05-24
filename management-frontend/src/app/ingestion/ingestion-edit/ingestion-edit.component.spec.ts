import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { IngestionEditComponent } from './ingestion-edit.component';
import { IngestionService, Ingestion } from '../ingestion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('IngestionEditComponent', () => {
  let component: IngestionEditComponent;
  let fixture: ComponentFixture<IngestionEditComponent>;
  let ingestionServiceSpy: jasmine.SpyObj<IngestionService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let activatedRouteStub: Partial<ActivatedRoute>;

  beforeEach(async () => {
    ingestionServiceSpy = jasmine.createSpyObj('IngestionService', [
      'getIngestion',
      'updateIngestion',
      'createIngestion',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [IngestionEditComponent],
      imports: [ReactiveFormsModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatCardModule, MatSelectModule, BrowserAnimationsModule],
      providers: [
        { provide: IngestionService, useValue: ingestionServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IngestionEditComponent);
    component = fixture.componentInstance;
  });

  it('should create component and initialize form', () => {
    component.ingestionId = null;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.ingestionForm).toBeDefined();

    const controls = component.ingestionForm.controls;
    expect(controls['sourceType']).toBeDefined();
    expect(controls['status']).toBeDefined();
  });

  it('should load ingestion if ingestionId exists', fakeAsync(() => {
    const mockIngestion: Ingestion = {
      _id: '123',
      sourceType: 'API',
      status: 'pending'
    };

    component.ingestionId = '123';
    ingestionServiceSpy.getIngestion.and.returnValue(of(mockIngestion));

    fixture.detectChanges();
    tick();

    expect(ingestionServiceSpy.getIngestion).toHaveBeenCalledWith('123');
    expect(component.ingestionForm.value).toEqual({
      sourceType: 'API',
      status: 'pending'
    });
  }));

  it('should show snackbar on getIngestion error', fakeAsync(() => {
    component.ingestionId = '123';
    ingestionServiceSpy.getIngestion.and.returnValue(throwError(() => new Error('Error')));

    fixture.detectChanges();
    tick();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to load ingestion', 'Close', { duration: 3000 });
  }));

  it('should call updateIngestion on save if ingestionId exists', fakeAsync(() => {
    component.ingestionId = '123';
    ingestionServiceSpy.getIngestion.and.returnValue(of({
      id: '123',
      sourceType: 'oldType',
      status: 'pending'
    }));

    ingestionServiceSpy.updateIngestion.and.returnValue(of());

    fixture.detectChanges();
    tick();

    // Update form to valid values
    component.ingestionForm.setValue({
      sourceType: 'New Source',
      status: 'completed'
    });

    component.save();
    tick();

    expect(ingestionServiceSpy.updateIngestion).toHaveBeenCalledWith({
      _id: '123',
      sourceType: 'New Source',
      status: 'completed'
    });
  }));

  it('should call createIngestion on save if no ingestionId', fakeAsync(() => {
    component.ingestionId = null;

    ingestionServiceSpy.createIngestion.and.returnValue(of());

    fixture.detectChanges();

    component.ingestionForm.setValue({
      sourceType: 'Created Source',
      status: 'pending'
    });

    component.save();
    tick();

    expect(ingestionServiceSpy.createIngestion).toHaveBeenCalledWith({
      _id: null,
      sourceType: 'Created Source',
      status: 'pending'
    });
  }));

  it('should show snackbar on save error', fakeAsync(() => {
    component.ingestionId = null;
    ingestionServiceSpy.createIngestion.and.returnValue(throwError(() => new Error('Save Error')));

    fixture.detectChanges();

    component.ingestionForm.setValue({
      sourceType: 'Fail Source',
      status: 'failed'
    });

    component.save();
    tick();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to save ingestion', 'Close', { duration: 3000 });
  }));

  it('should navigate back on cancel', () => {
    fixture.detectChanges();
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['dashboard/ingestion']);
  });

  it('should unsubscribe on destroy', () => {
    fixture.detectChanges();
    spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
  });
});
