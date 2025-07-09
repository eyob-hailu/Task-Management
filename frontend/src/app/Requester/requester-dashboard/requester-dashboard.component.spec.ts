import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequesterDashboardComponent } from './requester-dashboard.component';

describe('RequesterDashboardComponent', () => {
  let component: RequesterDashboardComponent;
  let fixture: ComponentFixture<RequesterDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequesterDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequesterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
