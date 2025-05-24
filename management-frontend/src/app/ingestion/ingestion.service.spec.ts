import { TestBed } from '@angular/core/testing';
import { IngestionService, Ingestion } from './ingestion.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('IngestionService', () => {
  let service: IngestionService;
  let httpMock: HttpTestingController;

  const dummyIngestions: Ingestion[] = [
    {
      _id: '1',
      sourceType: 'API',
      status: 'pending',
      createdAt: new Date()
    },
    {
      _id: '2',
      sourceType: 'File',
      status: 'completed',
      createdAt: new Date()
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [IngestionService]
    });

    service = TestBed.inject(IngestionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no unmatched requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all ingestions', () => {
    service.getIngestions().subscribe(ings => {
      expect(ings.length).toBe(2);
      expect(ings).toEqual(dummyIngestions);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/ingestions');
    expect(req.request.method).toBe('GET');
    req.flush(dummyIngestions);
  });

  it('should fetch one ingestion by id', () => {
    const ingestion = dummyIngestions[0];
    service.getIngestion('1').subscribe(ing => {
      expect(ing).toEqual(ingestion);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/ingestions/1');
    expect(req.request.method).toBe('GET');
    req.flush(ingestion);
  });

  it('should create a new ingestion', () => {
    const newIngestion: Ingestion = {
      sourceType: 'API',
      status: 'pending'
    };

    service.createIngestion(newIngestion).subscribe(ing => {
      expect(ing).toEqual({ ...newIngestion, _id: '3' });
    });

    const req = httpMock.expectOne('http://localhost:5000/api/ingestions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newIngestion);

    req.flush({ ...newIngestion, _id: '3' });
  });

  it('should update an existing ingestion', () => {
    const updatedIngestion: Ingestion = {
      _id: '1',
      sourceType: 'API',
      status: 'running'
    };

    service.updateIngestion(updatedIngestion).subscribe(ing => {
      expect(ing).toEqual(updatedIngestion);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/ingestions/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedIngestion);

    req.flush(updatedIngestion);
  });

  it('should delete an ingestion by id', () => {
    service.deleteIngestion('1').subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:5000/api/ingestions/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
