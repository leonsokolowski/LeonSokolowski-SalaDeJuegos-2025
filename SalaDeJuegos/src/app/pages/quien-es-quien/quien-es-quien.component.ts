import { Component, inject, OnInit } from '@angular/core';
import { Persona } from './persona';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-quien-es-quien',
  imports: [CommonModule, FormsModule],
  templateUrl: './quien-es-quien.component.html',
  styleUrl: './quien-es-quien.component.css'
})
export class QuienEsQuienComponent implements OnInit {
  private db = inject(DatabaseService);
  usuario: any = null;
  personas: Persona[] = [];
  personaSeleccionada!: Persona;
  personaNombre: string = '';
  intentos: number = 0;
  puntaje: number = 0;
  juegoTerminado: boolean = false;
  victoria: boolean = false;
  mensaje: string = '';
  mostrarPopupInicio: boolean = true;

  opcionesVisibles: string | null = null;
  botonesDeshabilitados: { [key: string]: boolean } = {
    genero: false,
    tipo_pelo: false,
    largo_pelo: false,
    color_pelo: false,
    color_ojos: false,
    tono_piel: false,
    usa_anteojos: false
  };

  opcionesDeshabilitadas: { [key: string]: boolean } = {};

  filtrosAplicados: { [key: string]: any } = {};
  
  valoresExcluidos: { [key: string]: any[] } = {
    genero: [],
    tipo_pelo: [],
    largo_pelo: [],
    color_pelo: [],
    color_ojos: [],
    tono_piel: [],
    usa_anteojos: []
  };

  constructor() { }

  async ngOnInit(){
    await this.obtenerUsuarioActual();
  }
  comenzarJuego(): void {
    this.mostrarPopupInicio = false;
    this.inicializarPersonas();
    this.iniciarJuego();
  }
  async obtenerUsuarioActual() {
    try {
      const userData = await this.db.traerUsuarioActual();
      console.log('Datos de usuario recibidos:', userData);
      
      if (userData && userData.length > 0) {
        this.usuario = userData[0];
        console.log('Usuario actual establecido:', this.usuario);
      } else {
        console.error('No se encontró un usuario actual. userData:', userData);
        
        const todosUsuarios = await this.db.listarUsuarios();
        if (todosUsuarios && todosUsuarios.length > 0) {
          this.usuario = todosUsuarios[0];
          console.log('Usuario alternativo establecido:', this.usuario);
        }
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
    }
  }

  inicializarPersonas(): void {
    this.personas = [
      new Persona('ale', 'femenino', 'rizado', 'medio', 'rubio', 'claros', 'palido', true),
      new Persona('beni', 'masculino', 'lacio', 'corto', 'rubio', 'marrones', 'palido', false),
      new Persona('borque', 'femenino', 'ondulado', 'largo', 'castaño', 'marrones', 'medio', false),
      new Persona('clara', 'femenino', 'lacio', 'medio', 'castaño', 'marrones', 'medio', false),
      new Persona('fer', 'masculino', 'lacio', 'corto', 'negro', 'marrones', 'oscuro', false),
      new Persona('juli', 'femenino', 'lacio', 'largo', 'castaño', 'marrones', 'medio', true),
      new Persona('laura', 'femenino', 'rizado', 'medio', 'castaño', 'marrones', 'oscuro', true),
      new Persona('lautaro', 'masculino', 'lacio', 'corto', 'negro', 'negros', 'oscuro', false),
      new Persona('leon', 'masculino', 'rizado', 'corto', 'rubio', 'claros', 'palido', false),
      new Persona('lucas', 'masculino', 'ondulado', 'corto', 'negro', 'claros', 'medio', false),
      new Persona('lucila', 'femenino', 'rizado', 'medio', 'negro', 'claros', 'palido', false),
      new Persona('nico', 'masculino', 'ondulado', 'corto', 'negro', 'negros', 'palido', true),
      new Persona('olga', 'femenino', 'lacio', 'medio', 'rubio', 'marrones', 'palido', true),
      new Persona('ortabe', 'femenino', 'ondulado', 'medio', 'castaño', 'marrones', 'medio', false),
      new Persona('rocio', 'femenino', 'lacio', 'largo', 'negro', 'claros', 'palido', false),
      new Persona('santi', 'masculino', 'ondulado', 'corto', 'castaño', 'marrones', 'oscuro', false),
      new Persona('sennes', 'masculino', 'ondulado', 'corto', 'castaño', 'marrones', 'medio', false),
      new Persona('soko', 'masculino', 'ondulado', 'corto', 'negro', 'negros', 'oscuro', false),
      new Persona('tomi', 'masculino', 'lacio', 'corto', 'negro', 'negros', 'palido', false),
      new Persona('wanda', 'femenino', 'ondulado', 'medio', 'negro', 'marrones', 'palido', false)
    ];
  }

  iniciarJuego(): void {
    const indiceAleatorio = Math.floor(Math.random() * this.personas.length);
    this.personaSeleccionada = this.personas[indiceAleatorio];
    console.log('Persona seleccionada:', this.personaSeleccionada.nombre);

    this.intentos = 0;
    this.puntaje = 0;
    this.juegoTerminado = false;
    this.victoria = false;
    this.mensaje = '';
    this.personaNombre = '';
    this.opcionesVisibles = null;
    
    this.botonesDeshabilitados = {
      genero: false,
      tipo_pelo: false,
      largo_pelo: false,
      color_pelo: false,
      color_ojos: false,
      tono_piel: false,
      usa_anteojos: false
    };
    
    this.opcionesDeshabilitadas = {};
    this.filtrosAplicados = {};
    this.valoresExcluidos = {
      genero: [],
      tipo_pelo: [],
      largo_pelo: [],
      color_pelo: [],
      color_ojos: [],
      tono_piel: [],
      usa_anteojos: []
    };
  }

  mostrarOpciones(tipo: string): void {
    if (this.botonesDeshabilitados[tipo]) {
      return;
    }
    
    if (tipo === 'usa_anteojos') {
      this.hacerPregunta('usa_anteojos', true);
      return;
    }
    
    this.opcionesVisibles = this.opcionesVisibles === tipo ? null : tipo;
  }

  getMensajeFormateado(tipo: string, valor: string | boolean, esCorrecta: boolean): string {
    if (esCorrecta) {
      if (tipo === 'usa_anteojos') {
        return '¡Correcto! La persona usa anteojos.';
      } else if (tipo === 'genero') {
        return `¡Correcto! La persona es de género ${valor}.`;
      } else if (tipo === 'tipo_pelo') {
        return `¡Correcto! La persona tiene pelo ${valor}.`;
      } else if (tipo === 'largo_pelo') {
        return `¡Correcto! La persona tiene pelo de largo ${valor}.`;
      } else if (tipo === 'color_pelo') {
        return `¡Correcto! La persona tiene pelo de color ${valor}.`;
      } else if (tipo === 'color_ojos') {
        return `¡Correcto! La persona tiene ojos de color ${valor}.`;
      } else if (tipo === 'tono_piel') {
        return `¡Correcto! La persona tiene tono de piel ${valor}.`;
      }
    } else {
      if (tipo === 'usa_anteojos') {
        return 'No, la persona no usa anteojos.';
      } else if (tipo === 'genero') {
        return `No, la persona no es de género ${valor}.`;
      } else if (tipo === 'tipo_pelo') {
        return `No, la persona no tiene pelo ${valor}.`;
      } else if (tipo === 'largo_pelo') {
        return `No, la persona no tiene pelo de largo ${valor}.`;
      } else if (tipo === 'color_pelo') {
        return `No, la persona no tiene pelo de color ${valor}.`;
      } else if (tipo === 'color_ojos') {
        return `No, la persona no tiene ojos de color ${valor}.`;
      } else if (tipo === 'tono_piel') {
        return `No, la persona no tiene tono de piel ${valor}.`;
      }
    }
    return '';
  }

  hacerPregunta(tipo: string, valor: string | boolean): void {
    if (this.juegoTerminado) {
      return;
    }

    this.intentos++;
    const esCorrecta = this.personaSeleccionada[tipo as keyof Persona] === valor;

    this.mensaje = this.getMensajeFormateado(tipo, valor, esCorrecta);

    if (esCorrecta) {
      this.botonesDeshabilitados[tipo] = true;
      this.filtrosAplicados[tipo] = valor;
    } else {
      this.opcionesDeshabilitadas[`${tipo}_${valor}`] = true; 
      
    
      this.valoresExcluidos[tipo].push(valor);
      
      if (tipo === 'usa_anteojos' && valor === true) {
        this.botonesDeshabilitados[tipo] = true; 
        this.filtrosAplicados[tipo] = false; 
      }
      
      if (tipo === 'genero') {
        const otroGenero = valor === 'masculino' ? 'femenino' : 'masculino';
        this.botonesDeshabilitados[tipo] = true; 
        this.filtrosAplicados[tipo] = otroGenero; 
      }
    }

    this.opcionesVisibles = null;
  }

  arriesgar(): void {
    if (this.juegoTerminado || !this.personaNombre.trim()) {
      return;
    }
    if (!this.usuario || !this.usuario.id) {
    console.warn("Usuario no cargado todavía.");
    return;
    }

    this.intentos++;
    
    if (this.personaNombre.toLowerCase() === this.personaSeleccionada.nombre.toLowerCase()) {
      this.victoria = true;
      this.juegoTerminado = true;
      this.calcularPuntaje();
      this.mensaje = `¡GANASTE! Has adivinado correctamente a ${this.personaSeleccionada.nombre}. Puntaje: ${this.puntaje}`;
    } else {
      this.victoria = false;
      this.juegoTerminado = true;
      this.puntaje = 0;
      this.mensaje = `¡PERDISTE! La persona correcta era ${this.personaSeleccionada.nombre}. Puntaje: 0`;
    }

    this.db.registrarResultadoQuienEsQuien({
      id_usuario: this.usuario.id ?? 'desconocido',
      intentos : this.intentos,
      victoria : this.victoria,
      puntaje : this.puntaje
    });
  }

  calcularPuntaje(): void {
    this.puntaje = 100;
    if (this.intentos === 1) {
      this.puntaje += 900; 
    } else if (this.intentos === 2) {
      this.puntaje += 800; 
    } else if (this.intentos === 3) {
      this.puntaje += 700; 
    } else if (this.intentos === 4) {
      this.puntaje += 600; 
    } else if (this.intentos === 5) {
      this.puntaje += 500; 
    } else if (this.intentos === 6) {
      this.puntaje += 400; 
    } else if (this.intentos === 7) {
      this.puntaje += 300; 
    } else if (this.intentos === 8) {
      this.puntaje += 200; 
    } else if (this.intentos === 9) {
      this.puntaje += 100; 
    }
  }

  reiniciarJuego(): void {
    this.iniciarJuego();
  }

  debeOcultarPersona(persona: Persona): boolean {
    for (const [key, value] of Object.entries(this.filtrosAplicados)) {
      if (persona[key as keyof Persona] !== value) {
        return true;
      }
    }
    
    for (const [key, values] of Object.entries(this.valoresExcluidos)) {
      if (values.includes(persona[key as keyof Persona])) {
        return true;
      }
    }
    
    return false;
  }

  getOpcionesGenero(): string[] {
    return ['masculino', 'femenino'];
  }

  getOpcionesTipoPelo(): string[] {
    return ['lacio', 'ondulado', 'rizado'];
  }

  getOpcionesLargoPelo(): string[] {
    return ['corto', 'medio', 'largo'];
  }

  getOpcionesColorPelo(): string[] {
    return ['rubio', 'castaño', 'negro'];
  }

  getOpcionesColorOjos(): string[] {
    return ['claros', 'marrones', 'negros'];
  }

  getOpcionesTonoPiel(): string[] {
    return ['palido', 'medio', 'oscuro'];
  }

  getOpcionesAnteojos(): boolean[] {
    return [true, false];
  }
}