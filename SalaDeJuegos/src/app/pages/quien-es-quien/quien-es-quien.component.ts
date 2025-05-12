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
  personasFiltradas: Persona[] = [];
  personaObjetivo!: Persona;

  preguntasPosibles = [
    { atributo: 'genero', valores: ['masculino', 'femenino'] },
    { atributo: 'tipo_pelo', valores: ['lacio', 'ondulado', 'rulos'] },
    { atributo: 'largo_pelo', valores: ['corto', 'medio', 'largo'] },
    { atributo: 'color_pelo', valores: ['negro', 'rubio', 'castaño', 'rojo'] },
    { atributo: 'color_ojos', valores: ['celestes', 'verdes', 'marrones', 'negros'] },
    { atributo: 'tono_piel', valores: ['palido', 'medio', 'oscuro'] },
    { atributo: 'usa_anteojos', valores: [true, false] }
  ];

  atributoSeleccionado: string = '';
  valorSeleccionado: any = null;
  valoresDisponibles: any[] = [];

  ngOnInit(): void {
    this.generarPersonas(); // Creamos las personas (fake o desde un servicio)
    this.personasFiltradas = [...this.personas];
    this.elegirPersonaObjetivo();
  }

  generarPersonas(): void {
    // Podés reemplazar esto por un JSON o un servicio externo
    this.personas = [
      new Persona('ale', 'femenino', 'rulos', 'medio', 'rubio', 'celestes', 'palido', true),
      new Persona('borque', 'femenino', 'ondulado', 'largo', 'castaño', 'marrones', 'medio', false),
      new Persona('clara', 'femenino', 'lacio', 'medio', 'castaño', 'marrones', 'palido', false),
      new Persona('fer', 'masculino', 'lacio', 'corto', 'negro', 'marrones', 'oscuro', false),
      new Persona('juli', 'femenino', 'lacio', 'largo', 'castaño', 'marrones', 'medio', true),
      new Persona('laura', 'femenino', 'rulos', 'medio', 'castaño', 'marrones', 'medio', true),
      new Persona('lautaro', 'masculino', 'lacio', 'corto', 'negro', 'negros', 'oscuro', false),
      new Persona('lucila', 'femenino', 'rulos', 'medio', 'negro', 'verdes', 'palido', false),
      new Persona('nico', 'masculino', 'ondulado', 'corto', 'castaño', 'marrones', 'medio', true),
      new Persona('olga', 'femenino', 'lacio', 'medio', 'rubio', 'marrones', 'palido', true),
      new Persona('ortabe', 'femenino', 'ondulado', 'medio', 'castaño', 'marrones', 'palido', false),
      new Persona('rocio', 'femenino', 'lacio', 'largo', 'negro', 'celestes', 'palido', false),
      new Persona('tomi', 'masculino', 'lacio', 'corto', 'negro', 'negros', 'medio', false),
      new Persona('rocio', 'femenino', 'ondulado', 'medio', 'negro', 'marrones', 'palido', false),
      new Persona('rocio', 'femenino', 'ondulado', 'medio', 'negro', 'marrones', 'palido', false),
      new Persona('rocio', 'femenino', 'ondulado', 'medio', 'negro', 'marrones', 'palido', false),
      new Persona('rocio', 'femenino', 'ondulado', 'medio', 'negro', 'marrones', 'palido', false),
      new Persona('rocio', 'femenino', 'ondulado', 'medio', 'negro', 'marrones', 'palido', false),
      new Persona('rocio', 'femenino', 'ondulado', 'medio', 'negro', 'marrones', 'palido', false),
      new Persona('rocio', 'femenino', 'ondulado', 'medio', 'negro', 'marrones', 'palido', false),
    ];
  }

  elegirPersonaObjetivo(): void {
    const indice = Math.floor(Math.random() * this.personas.length);
    this.personaObjetivo = this.personas[indice];
    console.log('Persona objetivo:', this.personaObjetivo);
  }

  actualizarValores(): void {
    const pregunta = this.preguntasPosibles.find(p => p.atributo === this.atributoSeleccionado);
    this.valoresDisponibles = pregunta ? pregunta.valores : [];
    this.valorSeleccionado = null;
  }

  preguntar(): void {
    if (!this.atributoSeleccionado || this.valorSeleccionado === null) return;

    const atributo = this.atributoSeleccionado as keyof Persona;
    const cumple = this.personaObjetivo[atributo] === this.valorSeleccionado;

    if (cumple) {
      this.personasFiltradas = this.personasFiltradas.filter(p => p[atributo] === this.valorSeleccionado);
    } else {
      this.personasFiltradas = this.personasFiltradas.filter(p => p[atributo] !== this.valorSeleccionado);
    }

    console.log(`Pregunta: ¿Tiene ${atributo} = ${this.valorSeleccionado}? Respuesta: ${cumple ? 'Sí' : 'No'}`);
    console.log('Personas restantes:', this.personasFiltradas);
  }
}

