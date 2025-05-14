import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComicsService } from '../../services/comics.service';
import { forkJoin } from 'rxjs';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preguntados.component.html',
  styleUrl: './preguntados.component.css'
})
export class PreguntadosComponent {
  private comics_service = inject(ComicsService);
  db = inject(DatabaseService);

  listaIds: number[] = [620,732,201,149,332,659,107,313,714,579,697,583,630,566,275,303,234,431,527,196,717,423,356,638,480,536,75,274,490,529,213,
    456,658,333,344,299,225,572,687,162,412,550,680,655,273,395,70,644,720,26538,491,632,542,76,194,298,37,384,641,455,370,558,576,309,678,522,165,
    457,514,216,60,405,204];
  personajesCargados: any[] = [];

  preguntas: any[] = [];
  personajesYaUsados: Set<string> = new Set();

  indiceActual: number = 0;
  opciones: string[] = [];
  respuestaCorrecta: string = '';

  puntos: number = 0;
  aciertos: number = 0;
  juegoTerminado: boolean = false;

  startTime: number = 0;
  endTime: number = 0;
  tiempoTotal: number = 0;
  usuarioActual: any = null;

  mostrarPopupInicio: boolean = true;

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
  iniciarJuego() {
    this.juegoTerminado = false;
    this.puntos = 0;
    this.aciertos = 0;
    this.indiceActual = 0;
    this.opciones = [];
    this.respuestaCorrecta = '';
    this.personajesCargados = [];
    this.preguntas = [];
    this.personajesYaUsados.clear();
    this.startTime = Date.now();

    const idsSeleccionados = this.obtenerIdsAleatorios(10, this.listaIds);
    const peticiones = idsSeleccionados.map(id => this.comics_service.traerPersonaje(id));

    forkJoin(peticiones).subscribe(personajes => {
      this.personajesCargados = personajes;
      this.preguntas = [...personajes]; 
      this.mostrarPregunta();
    });
  }

  obtenerIdsAleatorios(cantidad: number, lista: number[]): number[] {
    const copia = [...lista];
    const resultado: number[] = [];

    while (resultado.length < cantidad && copia.length > 0) {
      const indice = Math.floor(Math.random() * copia.length);
      resultado.push(copia.splice(indice, 1)[0]);
    }

    return resultado;
  }

  async registrarResultado() {
    const resultado = {
      id_usuario: this.usuarioActual.id,
      aciertos: this.aciertos,
      tiempo: this.tiempoTotal,
      puntaje: this.puntos
    };

    await this.db.registrarResultadoPreguntados(resultado);
  }

  mostrarPregunta() {
    if (this.indiceActual >= this.preguntas.length) {
      this.juegoTerminado = true;
      this.endTime = Date.now();
      this.tiempoTotal = Math.floor((this.endTime - this.startTime) / 1000); // segundos

      const multiplicador = this.calcularMultiplicador(this.tiempoTotal);
      this.puntos *= multiplicador;

      this.registrarResultado();
      return;
    }

    const personajeActual = this.preguntas[this.indiceActual];
    this.respuestaCorrecta = personajeActual.name;
    this.personajesYaUsados.add(this.respuestaCorrecta);

    const nombresIncorrectos = this.personajesCargados
      .map(p => p.name)
      .filter(n => n !== this.respuestaCorrecta && !this.personajesYaUsados.has(n));

    let opciones = this.obtenerOpciones(this.respuestaCorrecta, nombresIncorrectos);
    this.opciones = this.mezclarArray(opciones);
  }

  calcularMultiplicador(segundos: number): number {
  if (segundos <= 30) return 5;
  if (segundos <= 40) return 4;
  if (segundos <= 50) return 3;
  if (segundos <= 60) return 2;
  return 1;
  } 

  obtenerOpciones(correcto: string, incorrectos: string[]): string[] {
    const seleccionados: string[] = [];

    const copia = [...incorrectos];
    while (seleccionados.length < 3 && copia.length > 0) {
      const indice = Math.floor(Math.random() * copia.length);
      seleccionados.push(copia.splice(indice, 1)[0]);
    }

    while (seleccionados.length < 3) {
      const restantes = this.personajesCargados
        .map(p => p.name)
        .filter(n => n !== correcto && !seleccionados.includes(n));

      if (restantes.length === 0) break;

      const idx = Math.floor(Math.random() * restantes.length);
      seleccionados.push(restantes[idx]);
    }

    return [correcto, ...seleccionados];
  }

  mezclarArray(arr: any[]) {
    return arr.sort(() => Math.random() - 0.5);
  }

  verificarRespuesta(opcion: string) {
    if (opcion === this.respuestaCorrecta) {
      this.puntos += 100;
      this.aciertos++;
    }

    this.indiceActual++;
    this.mostrarPregunta();
  }
}
