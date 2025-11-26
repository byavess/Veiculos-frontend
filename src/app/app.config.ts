import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http'; // <--- ESSENCIAL!
//import { provideNoopAnimations } from '@angular/platform-browser/animations'; // <-- ESSENCIAL para Material

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // <--- Correção se estiver faltando
  //  provideNoopAnimations(),  // <--- Correção se estiver faltando
  ]
};