import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../../services/database.service';
interface ResultadoUsuario {
  id_usuario: number;
  nombre: string;
  puntaje: number;
  tiempo?: number;
  aciertos?: number;
  errores?: number;
  victoria?: boolean;
  intentos?: number;
  total_cartas?: number;
  palabra?: string;
}

@Component({
  selector: 'app-tabla-resultados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tablas-resultados.component.html',
  styleUrls: ['./tablas-resultados.component.css']
})
export class TablasResultadosComponent implements OnInit {
  resultadosAhorcado: ResultadoUsuario[] = [];
  resultadosMayorMenor: ResultadoUsuario[] = [];
  resultadosQuienEsQuien: ResultadoUsuario[] = [];
  resultadosPreguntados: ResultadoUsuario[] = [];
  
  cargando = true;
  error = false;
  db = inject(DatabaseService);

  ngOnInit(): void {
    this.cargarResultados();
  }

  async cargarResultados() {
    try {
      this.cargando = true;
      this.error = false;
      
      const [ahorcado, mayorMenor, quienEsQuien, preguntados] = await Promise.all([
        this.db.obtenerResultadosAhorcado(),
        this.db.obtenerResultadosMayorMenor(),
        this.db.obtenerResultadosQuienEsQuien(),
        this.db.obtenerResultadosPreguntados()
      ]);

      this.resultadosAhorcado = this.obtenerTop5SinRepetir(ahorcado.map(item => ({
        id_usuario: item.id_usuario,
        nombre: item.usuarios.nombre,
        puntaje: item.puntaje,
        tiempo: item.tiempo,
        aciertos: item.aciertos,
        errores: item.errores,
        palabra: item.palabra,
        victoria: item.victoria
      })));

      this.resultadosMayorMenor = this.obtenerTop5SinRepetir(mayorMenor.map(item => ({
        id_usuario: item.id_usuario,
        nombre: item.usuarios.nombre,
        puntaje: item.puntaje,
        aciertos: item.aciertos,
        errores: item.errores,
        total_cartas: item.total_cartas
      })));

      this.resultadosQuienEsQuien = this.obtenerTop5SinRepetir(quienEsQuien.map(item => ({
        id_usuario: item.id_usuario,
        nombre: item.usuarios.nombre,
        puntaje: item.puntaje,
        intentos: item.intentos,
        victoria: item.victoria
      })));

      this.resultadosPreguntados = this.obtenerTop5SinRepetir(preguntados.map(item => ({
        id_usuario: item.id_usuario,
        nombre: item.usuarios.nombre,
        puntaje: item.puntaje,
        tiempo: item.tiempo,
        aciertos: item.aciertos
      })));

    } catch (error) {
      console.error('Error al cargar resultados:', error);
      this.error = true;
    } finally {
      this.cargando = false;
    }
  }

  obtenerTop5SinRepetir(resultados: ResultadoUsuario[]): ResultadoUsuario[] {
    const resultadosOrdenados = resultados.sort((a, b) => {
      if (a.puntaje !== b.puntaje) {
        return b.puntaje - a.puntaje;
      }
      if (a.tiempo !== undefined && b.tiempo !== undefined) {
        return a.tiempo - b.tiempo;
      }
      return 0;
    });

    const mejoresResultadosPorUsuario = new Map<number, ResultadoUsuario>();
    resultadosOrdenados.forEach(resultado => {
      if (!mejoresResultadosPorUsuario.has(resultado.id_usuario)) {
        mejoresResultadosPorUsuario.set(resultado.id_usuario, resultado);
      }
    });

    return Array.from(mejoresResultadosPorUsuario.values()).slice(0, 5);
  }
}