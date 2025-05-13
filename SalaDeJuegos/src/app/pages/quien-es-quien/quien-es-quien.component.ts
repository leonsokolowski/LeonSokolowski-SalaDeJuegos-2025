import { Component, OnInit } from '@angular/core';
import { Persona } from './persona';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quien-es-quien',
  imports: [CommonModule, FormsModule],
  templateUrl: './quien-es-quien.component.html',
  styleUrl: './quien-es-quien.component.css'
})
export class QuienEsQuienComponent implements OnInit {
  personas: Persona[] = [];
  personaSeleccionada!: Persona;
  personaNombre: string = '';
  intentos: number = 0;
  puntaje: number = 0;
  juegoTerminado: boolean = false;
  victoria: boolean = false;
  mensaje: string = '';

  // Estados de los botones
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

  // Filtros aplicados
  filtrosAplicados: { [key: string]: any } = {};
  
  // Valores excluidos para cada característica
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

  ngOnInit(): void {
    this.inicializarPersonas();
    this.iniciarJuego();
  }

  inicializarPersonas(): void {
    // Creamos las 20 personas con diferentes características
    this.personas = [
      new Persona('ale', 'femenino', 'rulos', 'medio', 'rubio', 'celestes', 'palido', true),
      new Persona('beni', 'masculino', 'lacio', 'corto', 'rubio', 'marrones', 'palido', false),
      new Persona('borque', 'femenino', 'ondulado', 'largo', 'castño', 'marrones', 'medio', false),
      new Persona('clara', 'femenino', 'lacio', 'medio', 'castaño', 'marrones', 'medio', false),
      new Persona('fer', 'masculino', 'lacio', 'corto', 'negro', 'negros', 'oscuro', false),
      new Persona('juli', 'femenino', 'lacio', 'largo', 'castaño', 'marrones', 'medio', true),
      new Persona('laura', 'femenino', 'rulos', 'medio', 'castaño', 'marrones', 'oscuro', true),
      new Persona('lautaro', 'masculino', 'lacio', 'corto', 'negro', 'marrones', 'oscuro', false),
      new Persona('leon', 'masculino', 'rulos', 'corto', 'rubio', 'verdes', 'palido', false),
      new Persona('lucas', 'masculino', 'ondulado', 'corto', 'negro', 'celestes', 'medio', false),
      new Persona('lucila', 'femenino', 'rulos', 'medio', 'negro', 'marrones', 'palido', false),
      new Persona('nico', 'masculino', 'ondulado', 'corto', 'negro', 'negros', 'palido', true),
      new Persona('olga', 'femenino', 'lacio', 'medio', 'rubio', 'marrones', 'palido', true),
      new Persona('ortabe', 'femenino', 'ondulado', 'medio', 'castaño', 'marrones', 'medio', false),
      new Persona('rocio', 'femenino', 'lacio', 'largo', 'negro', 'celestes', 'palido', false),
      new Persona('santi', 'masculino', 'ondulado', 'corto', 'castaño', 'verdes', 'oscuro', true),
      new Persona('sennes', 'masculino', 'ondulado', 'corto', 'castaño', 'marrones', 'medio', false),
      new Persona('soko', 'masculino', 'ondulado', 'corto', 'negro', 'negros', 'oscuro', false),
      new Persona('tomi', 'masculino', 'lacio', 'corto', 'negro', 'negros', 'palido', false),
      new Persona('wanda', 'femenino', 'ondulado', 'medio', 'negro', 'marrones', 'palido', false)
    ];
  }

  iniciarJuego(): void {
    // Seleccionar persona aleatoria
    const indiceAleatorio = Math.floor(Math.random() * this.personas.length);
    this.personaSeleccionada = this.personas[indiceAleatorio];
    console.log('Persona seleccionada:', this.personaSeleccionada.nombre);

    // Reiniciar estados
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
    
    // Para el caso especial de "usa_anteojos", hacer la pregunta directamente
    if (tipo === 'usa_anteojos') {
      this.hacerPregunta('usa_anteojos', true);
      return;
    }
    
    this.opcionesVisibles = this.opcionesVisibles === tipo ? null : tipo;
  }

  hacerPregunta(tipo: string, valor: string | boolean): void {
    if (this.juegoTerminado) {
      return;
    }

    this.intentos++;
    const esCorrecta = this.personaSeleccionada[tipo as keyof Persona] === valor;

    if (esCorrecta) {
      this.mensaje = `¡Correcto! La persona ${tipo === 'usa_anteojos' ? 'usa anteojos' : `tiene ${valor}`}.`;
      this.botonesDeshabilitados[tipo] = true; // Deshabilitar toda la categoría
      this.filtrosAplicados[tipo] = valor;
    } else {
      this.mensaje = `No, la persona ${tipo === 'usa_anteojos' ? 'no usa anteojos' : `no tiene ${valor}`}.`;
      this.opcionesDeshabilitadas[`${tipo}_${valor}`] = true; // Deshabilitar solo esa opción
      
      // Agregar el valor a la lista de valores excluidos
      this.valoresExcluidos[tipo].push(valor);
      
      // Si es "usa_anteojos" y la respuesta es no, entonces sabemos que es false
      if (tipo === 'usa_anteojos' && valor === true) {
        this.botonesDeshabilitados[tipo] = true; // Deshabilitar el botón
        this.filtrosAplicados[tipo] = false; // Guardar el valor opuesto como filtro
      }
    }

    // Cerrar las opciones
    this.opcionesVisibles = null;
  }

  arriesgar(): void {
    if (this.juegoTerminado || !this.personaNombre.trim()) {
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
  }

  calcularPuntaje(): void {
    // Base: 100 puntos por victoria
    this.puntaje = 100;
    
    // Bonificación por intentos
    if (this.intentos === 1) {
      this.puntaje += 900; // 1000 total
    } else if (this.intentos === 2) {
      this.puntaje += 800; // 900 total
    } else if (this.intentos === 3) {
      this.puntaje += 700; // 800 total
    } else if (this.intentos === 4) {
      this.puntaje += 600; // 700 total
    } else if (this.intentos === 5) {
      this.puntaje += 500; // 600 total
    } else if (this.intentos === 6) {
      this.puntaje += 400; // 500 total
    } else if (this.intentos === 7) {
      this.puntaje += 300; // 400 total
    } else if (this.intentos === 8) {
      this.puntaje += 200; // 300 total
    } else if (this.intentos === 9) {
      this.puntaje += 100; // 200 total
    }
    // 10 o más intentos: solo los 100 puntos base
  }

  reiniciarJuego(): void {
    this.iniciarJuego();
  }

  debeOcultarPersona(persona: Persona): boolean {
    // Revisar si la persona cumple con todos los filtros aplicados
    for (const [key, value] of Object.entries(this.filtrosAplicados)) {
      if (persona[key as keyof Persona] !== value) {
        return true; // La persona no cumple con algún filtro aplicado
      }
    }
    
    // Revisar si la persona tiene algún valor excluido
    for (const [key, values] of Object.entries(this.valoresExcluidos)) {
      if (values.includes(persona[key as keyof Persona])) {
        return true; // La persona tiene un valor que ha sido excluido
      }
    }
    
    return false; // La persona cumple con todos los filtros y no tiene valores excluidos
  }

  // Métodos auxiliares para mostrar opciones específicas
  getOpcionesGenero(): string[] {
    return ['masculino', 'femenino'];
  }

  getOpcionesTipoPelo(): string[] {
    return ['lacio', 'ondulado', 'corto'];
  }

  getOpcionesLargoPelo(): string[] {
    return ['corto', 'medio', 'largo'];
  }

  getOpcionesColorPelo(): string[] {
    return ['rubio', 'castaño', 'negro'];
  }

  getOpcionesColorOjos(): string[] {
    return ['celestes', 'verdes', 'marrones', 'negros'];
  }

  getOpcionesTonoPiel(): string[] {
    return ['palido', 'medio', 'oscuro'];
  }

  getOpcionesAnteojos(): boolean[] {
    return [true, false];
  }
}
