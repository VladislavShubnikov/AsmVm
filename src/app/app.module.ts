import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { RegistersComponent } from './registers/registers.component';
import { InstructionComponent } from './instruction/instruction.component';
import { InstrSetComponent } from './instrset/instrset.component';
import { ConsoleComponent } from './console/console.component';
import { VirtualMachineComponent } from './virtual-machine/virtual-machine.component';

import { TestService } from './services/testservice';
import { MemoryViewerComponent } from './memoryviewer/memoryviewer.component';
import { RandomComponent } from './random/random.component';
import { RegflagsComponent } from './regflags/regflags.component';

@NgModule({
  declarations: [
    AppComponent,
    RegistersComponent,
    InstructionComponent,
    InstrSetComponent,
    ConsoleComponent,
    VirtualMachineComponent,
    MemoryViewerComponent,
    RandomComponent,
    RegflagsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    // tslint:disable-next-line
    NgbModule.forRoot()
  ],
  providers: [
    TestService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
