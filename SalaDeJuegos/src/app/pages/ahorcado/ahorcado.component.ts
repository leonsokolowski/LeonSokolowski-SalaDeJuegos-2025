import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LISTADO_PALABRAS as listado_palabras } from './palabrasAhorcado';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  templateUrl: './ahorcado.component.html',
  styleUrls: ['./ahorcado.component.css'],
  imports: [CommonModule] // Necesario para *ngFor, *ngIf, etc.
})
export class AhorcadoComponent {
  auth = inject(AuthService);
  db = inject(DatabaseService);

  abecedario: string[] = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  palabraSecreta: string = '';
  letrasPalabra: string[] = [];
  letrasDescubiertas: string[] = [];
  letrasSeleccionadas: string[] = [];
  letrasIncorrectas: string[] = [];
  intentosRestantes: number = 6;
  juegoTerminado: boolean = false;
  victoria: boolean = false;
  tiempoInicio: number = 0;

  ngOnInit(): void {
    this.iniciarJuego();
  }

  iniciarJuego(): void {
    this.palabraSecreta = this.obtenerPalabraAleatoria().toUpperCase();
    this.letrasPalabra = this.palabraSecreta.split('');
    this.letrasDescubiertas = new Array(this.letrasPalabra.length).fill('');
    this.letrasSeleccionadas = [];
    this.letrasIncorrectas = [];
    this.intentosRestantes = 6;
    this.juegoTerminado = false;
    this.victoria = false;
    this.tiempoInicio = Date.now();
  }

  obtenerPalabraAleatoria(): string {
    const indice = Math.floor(Math.random() * listado_palabras.length);
    return listado_palabras[indice];
  }

  seleccionarLetra(letra: string): void {
    if (
      this.juegoTerminado ||
      this.letrasSeleccionadas.includes(letra) ||
      this.letrasIncorrectas.includes(letra)
    ) {
      return;
    }

    let acierto = false;

    this.letrasPalabra.forEach((l, i) => {
      if (l === letra) {
        this.letrasDescubiertas[i] = letra;
        acierto = true;
      }
    });

    if (acierto) {
      this.letrasSeleccionadas.push(letra);
    } else {
      this.letrasIncorrectas.push(letra);
      this.intentosRestantes--;
    }

    if (this.letrasDescubiertas.join('') === this.palabraSecreta) {
      this.juegoTerminado = true;
      this.victoria = true;
      this.registrarResultado();
    }

    if (this.intentosRestantes === 0) {
      this.juegoTerminado = true;
      this.victoria = false;
      this.registrarResultado();
    }
  }

  registrarResultado(): void {
    const tiempoFinal = (Date.now() - this.tiempoInicio) / 1000;

    const resultado = {
      usuario: this.auth.usuarioActual?.email ?? 'desconocido',
      palabra: this.palabraSecreta,
      aciertos: this.letrasSeleccionadas.length,
      errores: this.letrasIncorrectas.length,
      victoria: this.victoria,
      tiempo: tiempoFinal
    };

    console.log('Resultado del juego:', resultado);

    // TODO: Guardar en Supabase usando `this.db` cuando implementes ese método.
  }
}
