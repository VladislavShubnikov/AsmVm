# AsmVm

Assembler Virtual Machine (very limited CPU emulation) run inside Angular environment. This app allow to compile and run step-by-step simple assempler code.
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.2.1.
In fact, this is not classic "Virtual Machine": source code is not compiled into actual processor instruction set. Instead, source code is compiled into some
internal instruction representation, and then you can run all instruction set as usual program or step by step (like many debuggers offer). This project is
targeted mainly for educational purposes.

![Background image](src/logo_page.jpg)


### Overview

This project can run basic intel-based cpu commands like add, mov, inc, etc. Working with 32 bit data and registers only. You can use this project
as a virtual assembler machine inside web browser app. 

## Working web-app demonstration
Preliminary demonstration is available in:
http://d-inter.ru/private/Vlad/nirs/2018_AsmVm/AsmVm/

### Implementation notes

Will be later

### Implementation restiction
1. Only russian language is supported in interface.
2. Only very limited set of Intel CPU instructions are supported.
3. No flags register visualization.
4. No coloring for the modified values


## Prerequisites

### Node.js and Tools

Download link:
[NodeJS](https://nodejs.org/en/download/).

Version not below than v.10.10.0 is required.

After NodeJS installation please check that everything is installed correctly (for example, PATH ), using command:
```
node --version
```
Stdout should be
v10.10.0 (or higher).

## Start working with project

Run `npm install` to load all requied Node packages. They will appear in `node_modules` folder.

## Install Angular 6.2.1
Run command:
```
npm install -g @angular/cli
```
and then check version by command:
```
ng -v
```
Angular version should be not less then:
Angular CLI: 6.2.1

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
Run `ng serve --open` to start dev server and immediately open browser with url `http://localhost:4200/`.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Compile and strong syntax check

Run `ng lint` to compile project source codes.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
Better way for final deployment is command:
```
ng build --prod --base-href https://your.site/somefolder/
```

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
