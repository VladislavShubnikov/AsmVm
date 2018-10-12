import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { RegistersComponent } from './registers/registers.component';
import { InstructionComponent } from './instruction/instruction.component';
import { InstrSetComponent } from './instrset/instrset.component';
import { ConsoleComponent } from './console/console.component';
import { VirtualMachineComponent } from './virtual-machine/virtual-machine.component';

import { TestService } from './services/testservice';

@NgModule({
  declarations: [
    AppComponent,
    RegistersComponent,
    InstructionComponent,
    InstrSetComponent,
    ConsoleComponent,
    VirtualMachineComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    TestService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
