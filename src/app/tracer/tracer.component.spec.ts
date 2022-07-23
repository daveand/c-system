import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TracerComponent } from './tracer.component';

describe('TracerComponent', () => {
  let component: TracerComponent;
  let fixture: ComponentFixture<TracerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TracerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TracerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
