import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  title = 'Teste veiculos';

  ngOnInit() {
    console.log('✅ AppComponent carregado!');
    console.log('✅ Angular está funcionando!');
  }
}
