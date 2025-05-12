import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Usuario } from '../classes/usuario';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  sb = inject(SupabaseService);
  auth = inject(AuthService);

  async listarUsuarios() {
    const { data, error } = await this.sb.supabase.from('usuarios').select('*');
    const usuarios = data as Usuario[];
    console.log(usuarios);
    return usuarios;
  }

  async traerUsuarioActual()
  {
    const { data, error } = await this.sb.supabase.from("usuarios").select("*").eq("correo", this.auth.usuarioActual?.email);
    return data;
  }

  async registrarUsuario(usuario: Usuario) {
    const { data, error } = await this.sb.supabase
      .from('usuarios')
      .insert(usuario);
    console.log(data);
  }

  async registrarResultadoAhorcado(resultado: {
    usuario: string;
    palabra: string;
    aciertos: number;
    errores: number;
    victoria: boolean;
    tiempo: number;
    puntaje: number;
  }) {
    const { data, error } = await this.sb.supabase.from('resultados_ahorcado').insert([resultado])
    if (error) {
      console.error("Error al registrar resultado:", error);
    } else {
      console.log("Resultado registrado:", data);
    }
  }

  async registrarResultadoMayorMenor(resultado: {
    id_usuario: number;
    aciertos: number;
    errores: number;
    total_cartas: number;
    puntaje : number;
  }) {
    const { data, error } = await this.sb.supabase.from('resultados_mayor_menor').insert([resultado]);
    if (error) {
      console.error("Error al registrar resultado:", error);
    } else {
      console.log("Resultado registrado:", data);
    }
  }
}
