import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRequesterTasksComponent } from './view-requester-tasks.component';

describe('ViewRequesterTasksComponent', () => {
  let component: ViewRequesterTasksComponent;
  let fixture: ComponentFixture<ViewRequesterTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRequesterTasksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRequesterTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
