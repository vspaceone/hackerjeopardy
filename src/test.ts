// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Manually import all .spec.ts files
// Uncomment for testing:
// import '../tests/app.component.spec';
// import '../tests/game-data.service.spec';
// import '../tests/content-manager.service.spec';
// import '../tests/game.service.spec';
// import '../tests/audio.service.spec';
// import '../tests/game-board.component.spec';
// import '../tests/player-controls.component.spec';
// import '../tests/question-display.component.spec';
// import '../tests/set-selection.component.spec';
