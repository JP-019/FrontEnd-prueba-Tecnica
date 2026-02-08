import { TestBed } from '@angular/core/testing';

import { DetalleOrden } from './detalle-orden';

describe('DetalleOrden', () => {
  let service: DetalleOrden;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetalleOrden);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
