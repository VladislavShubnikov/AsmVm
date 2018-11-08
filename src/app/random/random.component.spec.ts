import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomComponent } from './random.component';

describe('RandomComponent', () => {
  let randomGen: RandomComponent;
  let fixture: ComponentFixture<RandomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RandomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RandomComponent);
    randomGen = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(randomGen).toBeTruthy();
  });

  it('test pseudorandom', () => {
    randomGen.initRandomSeed();
    const r0 = randomGen.getNextRandomInt();
    let rnd = 0;
    let sequenceLength = 0;
    while (rnd !== r0) {
      rnd = randomGen.getNextRandomInt();
      sequenceLength++;
    } // while
    const EXPECT_SEQ_LEN = 65000;
    // console.log(`rnd. sequenceLength = ${sequenceLength}`);
    expect(sequenceLength >= EXPECT_SEQ_LEN).toEqual(true);
  });

});
