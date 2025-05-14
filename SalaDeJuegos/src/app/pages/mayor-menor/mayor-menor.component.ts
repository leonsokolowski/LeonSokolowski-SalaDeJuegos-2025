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

  usuario: any = null;
  mazo: Carta[] = [];
  cartaActual: Carta | null = null;
  indexCartaActual: number = 0;

  aciertos: number = 0;
  errores: number = 0;
  tiempoRestante: number = 5;
  juegoTerminado: boolean = false;
  juegoIniciado: boolean = false;  
  puntaje : number = 0;
  private intervaloTimer: any;  

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
    this.juegoIniciado = true;  
    this.cartaActual = this.mazo[this.indexCartaActual];
    this.tiempoRestante = 5; 
    this.iniciarTemporizador();  
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
      this.tiempoRestante = 5; 
      this.iniciarTemporizador();  
    }
  }

  private finalizarJuego(): void {
    this.juegoTerminado = true;
    this.puntaje = this.aciertos * 10;
    
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
    if (this.intervaloTimer) {
      clearInterval(this.intervaloTimer);
    }

    this.intervaloTimer = setInterval(() => {
      if (this.tiempoRestante === 0 || this.juegoTerminado) {
        clearInterval(this.intervaloTimer);
        if (this.tiempoRestante === 0 && this.indexCartaActual < this.mazo.length - 1) {
          
          this.errores++;

          
          this.indexCartaActual++;
          this.cartaActual = this.mazo[this.indexCartaActual];
          this.tiempoRestante = 5;  
          this.iniciarTemporizador(); 
        }
      } else {
        this.tiempoRestante--;
      }
    }, 1000);
  }
}
