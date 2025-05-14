import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LISTADO_PALABRAS as listado_palabras } from './palabrasAhorcado';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  templateUrl: './ahorcado.component.html',
  styleUrls: ['./ahorcado.component.css'],
  imports: [CommonModule, FormsModule] 
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
  palabraAdivinada: string = '';
  rutaImagenAhorcado: string = '';
  puntaje: number = 0;
  mostrarPopupInicio: boolean = true;
  usuarioActual: any = null;

  async ngOnInit() {
    await this.obtenerUsuarioActual();
  }

  comenzarJuego(): void {
    this.mostrarPopupInicio = false;
    this.iniciarJuego();
  }

  async obtenerUsuarioActual() {
    try {
      const userData = await this.db.traerUsuarioActual();
      console.log('Datos de usuario recibidos:', userData);
      
      if (userData && userData.length > 0) {
        this.usuarioActual = userData[0];
        console.log('Usuario actual establecido:', this.usuarioActual);
      } else {
        console.error('No se encontró un usuario actual. userData:', userData);
        
        const todosUsuarios = await this.db.listarUsuarios();
        if (todosUsuarios && todosUsuarios.length > 0) {
          this.usuarioActual = todosUsuarios[0];
          console.log('Usuario alternativo establecido:', this.usuarioActual);
        }
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
    }
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
    this.palabraAdivinada = '';
    this.puntaje = 0;

    this.actualizarImagen();
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

    this.actualizarImagen();
  }

  arriesgarPalabra(): void {
    if (this.juegoTerminado || !this.palabraAdivinada.trim()) {
      return;
    }
  
    const intento = this.palabraAdivinada.toUpperCase();
    if (intento === this.palabraSecreta) {
      this.letrasDescubiertas = [...this.letrasPalabra];
      this.victoria = true;
    } else {
      this.intentosRestantes = 0;
      this.victoria = false;
    }
  
    this.juegoTerminado = true;
    this.registrarResultado();
    this.actualizarImagen();
  }

  registrarResultado(): void {
    const tiempoFinal = (Date.now() - this.tiempoInicio) / 1000;
  
    if (this.victoria) {
      this.puntaje = 100;
  
      if (tiempoFinal < 30) {
        this.puntaje += 50;
      } else if (tiempoFinal < 60) {
        this.puntaje += 25;
      }
  
      this.puntaje -= this.letrasIncorrectas.length * 5;
  
      if (this.palabraSecreta.length > 8) {
        this.puntaje *= 2;
      }
    } else {
      this.puntaje = 0;
    }
  
    const resultado = {
      id_usuario: this.usuarioActual.id ?? 0,
      palabra: this.palabraSecreta,
      aciertos: this.letrasSeleccionadas.length,
      errores: this.letrasIncorrectas.length,
      victoria: this.victoria,
      tiempo: tiempoFinal,
      puntaje: this.puntaje
    };
    
    this.db.registrarResultadoAhorcado(resultado);
    console.log('Resultado del juego:', resultado);
  }
  
  private actualizarImagen(): void {
    if (this.juegoTerminado && !this.victoria && this.intentosRestantes === 0) {
      this.rutaImagenAhorcado = 'assets/ahorcado/intentos_restantes_0.png';
      
      setTimeout(() => {
        this.rutaImagenAhorcado = 'assets/ahorcado/derrota.png';
      }, 1000);
    } else if (this.juegoTerminado && this.victoria) {
      this.rutaImagenAhorcado = 'assets/ahorcado/victoria.png';
    } else {
      this.rutaImagenAhorcado = `assets/ahorcado/intentos_restantes_${this.intentosRestantes}.png`;
    }
  }
}
