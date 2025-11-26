// src/app/guards/auth.guard.ts - CÓDIGO COMPLETO E CORRIGIDO
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';


// Exportando a função CanActivateFn para uso nas rotas (RESOLVE TS2307)
export const authGuard: CanActivateFn = (route, state) => {
  // A injeção é necessária para acessar o Router em uma função Standalone
  const router = inject(Router); 
  
  // Verifica se o token de autenticação existe no localStorage
  const token = localStorage.getItem('auth_token');

  if (token) {
    return true; // Token existe, permite acesso à rota /admin
  } else {
    // Token não existe, redireciona para a página de login
    inject(Router).navigate(['/auth/login']);
    return false; // Bloqueia o acesso
  }
};