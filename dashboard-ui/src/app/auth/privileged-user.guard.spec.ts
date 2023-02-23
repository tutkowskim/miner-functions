import { TestBed } from '@angular/core/testing';

import { PrivilegedUserGuard } from './privileged-user.guard';

describe('PrivilegedUserGuardGuard', () => {
  let guard: PrivilegedUserGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PrivilegedUserGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});