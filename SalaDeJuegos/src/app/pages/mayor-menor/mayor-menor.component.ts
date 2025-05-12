import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Carta, Palo } from './carta';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mayor-menor.component.html',
  styleUrls: ['./mayor-menor.component.css']
})
export class MayorMenorComponent implements OnInit {

  private db = inject(DatabaseService);
  private authService = inject(AuthService);

  usuario: any = null;
  mazo: Carta[] = [];
  cartaActual: Carta | null = null;
  indexCartaActual: number = 0;

  aciertos: number = 0;
  errores: number = 0;
  tiempoRestante: number = 5;
  juegoTerminado: boolean = false;
  juegoIniciado: boolean = false;  // Control de si el juego ha comenzado
  puntaje : number = 0;
  private intervaloTimer: any;  // Para almacenar el intervalo del temporizador

  ngOnInit(): void {
    setTimeout(async () => {
      const resultado = await this.db.traerUsuarioActual();
      this.usuario = resultado && resultado.length > 0 ? resultado[0] : null;
    }, 20);
  }

  private crearMazo(): Carta[] {
    const palos: Palo[] = ['espadas', 'bastos', 'oros', 'copas'];
    const mazo: Carta[] = [];

    for (const palo of palos) {
      for (let numero = 1; numero <= 12; numero++) {
        mazo.push({ numero, palo });
      }
    }

    return mazo;
  }

  private mezclarMazo(mazo: Carta[]): Carta[] {
    return mazo.sort(() => Math.random() - 0.5);
  }

  iniciarJuego(): void {
    this.mazo = this.mezclarMazo(this.crearMazo());
    this.indexCartaActual = 0;
    this.aciertos = 0;
    this.errores = 0;
    this.puntaje = 0
    this.juegoTerminado = false;
    this.juegoIniciado = true;  // Marcamos que el juego ha comenzado
    this.cartaActual = this.mazo[this.indexCartaActual];
    this.tiempoRestante = 5; // Reiniciar el tiempo
    this.iniciarTemporizador();  // Iniciar el temporizador
  }

  jugar(eleccion: 'mayor' | 'menor'): void {
    if (this.juegoTerminado || this.indexCartaActual >= this.mazo.length - 1) {
      this.finalizarJuego();
      return;
    }

    const siguienteCarta = this.mazo[this.indexCartaActual + 1];
    const resultado =
      (eleccion === 'mayor' && siguienteCarta.numero > this.cartaActual!.numero) ||
      (eleccion === 'menor' && siguienteCarta.numero < this.cartaActual!.numero);

    if (resultado) {
      this.aciertos++;
    } else {
      this.errores++;
    }

    this.indexCartaActual++;
    this.cartaActual = siguienteCarta;

    if (this.indexCartaActual >= this.mazo.length - 1) {
      this.finalizarJuego();
    } else {
      this.tiempoRestante = 5; // Resetear el timer cuando se cambia la carta
      this.iniciarTemporizador();  // Volver a iniciar el temporizador
    }
  }

  private finalizarJuego(): void {
    this.juegoTerminado = true;
    this.puntaje = this.aciertos * 10;
    const usuario = this.authService.usuarioActual;

    this.db.registrarResultadoMayorMenor({
      id_usuario: this.usuario.id ?? 'desconocido',
      aciertos: this.aciertos,
      errores: this.errores,
      total_cartas: this.mazo.length,
      puntaje : this.puntaje
    });
  }

  getImagenCarta(carta: Carta | null): string {
    if (!carta) return '';
    return `assets/mayor_menor/${carta.numero}_${carta.palo}.png`;
  }

  private iniciarTemporizador(): void {
    // Limpiar el intervalo anterior antes de comenzar uno nuevo
    if (this.intervaloTimer) {
      clearInterval(this.intervaloTimer);
    }

    // Iniciar el nuevo intervalo de temporizador
    this.intervaloTimer = setInterval(() => {
      if (this.tiempoRestante === 0 || this.juegoTerminado) {
        clearInterval(this.intervaloTimer);
        if (this.tiempoRestante === 0 && this.indexCartaActual < this.mazo.length - 1) {
          // Si el tiempo se acaba y no se hizo ninguna elección, sumar como error
          this.errores++;

          // Cambiar carta si el tiempo se acabó
          this.indexCartaActual++;
          this.cartaActual = this.mazo[this.indexCartaActual];
          this.tiempoRestante = 5;  // Reiniciar el temporizador para la siguiente carta
          this.iniciarTemporizador();  // Reiniciar el temporizador para la próxima carta
        }
      } else {
        this.tiempoRestante--;
      }
    }, 1000);
  }
}
