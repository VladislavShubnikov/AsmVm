import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryViewerComponent } from './memoryviewer.component';

describe('MemoryViewerComponent', () => {
  let memViewer: MemoryViewerComponent;
  let fixture: ComponentFixture<MemoryViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemoryViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoryViewerComponent);
    memViewer = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(memViewer).toBeTruthy();
  });

});
