import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentService, Document } from './document.service';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentService]
    });

    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch documents', () => {
    const dummyDocs: Document[] = [
      { _id: '1', title: 'Doc1', description: 'Doc1', url: 'url1' },
      { _id: '2', title: 'Doc2', description: 'Doc1', url: 'url2' }
    ];

    service.getDocuments().subscribe(docs => {
      expect(docs.length).toBe(2);
      expect(docs).toEqual(dummyDocs);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/documents');
    expect(req.request.method).toBe('GET');
    req.flush(dummyDocs);
  });

  it('should upload a document', () => {
    const dummyDoc: Document = { _id: '1', title: 'NewDoc', description: 'New Doc', url: 'url' };
    const formData = new FormData();
    formData.append('file', new File([], 'test.pdf'));

    service.uploadDocument(formData).subscribe(doc => {
      expect(doc).toEqual(dummyDoc);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/documents/upload');
    expect(req.request.method).toBe('POST');
    req.flush(dummyDoc);
  });

  it('should delete a document', () => {
    service.deleteDocument('1').subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:5000/api/documents/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
