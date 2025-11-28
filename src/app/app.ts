import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div style="padding: 20px; text-align: center;">
      <h1>🚗 Teste Veículos - FUNCIONANDO! 🎉</h1>
      <p>Página inicial carregada com sucesso!</p>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'Teste veiculos';
}