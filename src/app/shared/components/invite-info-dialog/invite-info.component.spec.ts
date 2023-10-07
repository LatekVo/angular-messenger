import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteInfoComponent } from './invite-info.component';

describe('InviteInfoComponent', () => {
  let component: InviteInfoComponent;
  let fixture: ComponentFixture<InviteInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InviteInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviteInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
