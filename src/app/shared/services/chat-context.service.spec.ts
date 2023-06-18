import { TestBed } from '@angular/core/testing';

import { ChatContextService } from './chat-context.service';

describe('ChatContextService', () => {
  let service: ChatContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
