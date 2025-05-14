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
    try {
      console.log("Buscando usuario con correo:", this.auth.usuarioActual?.email);
      
      if (!this.auth.usuarioActual?.email) {
        console.warn("Email del usuario actual no disponible");
        return [];
      }
      
      const { data, error } = await this.sb.supabase
        .from("usuarios")
        .select("*")
        .eq("correo", this.auth.usuarioActual.email);
      
      if (error) {
        console.error("Error al obtener usuario actual:", error);
        return [];
      }
      
      console.log("Usuario encontrado:", data);
      return data;
    } catch (e) {
      console.error("Excepción al obtener usuario actual:", e);
      return [];
    }
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
  async registrarResultadoQuienEsQuien(resultado: {
    id_usuario: number;
    intentos: number;
    victoria : boolean;
    puntaje : number;
  }) {
    const { data, error } = await this.sb.supabase.from('resultados_quien_es_quien').insert([resultado]);
    if (error) {
      console.error("Error al registrar resultado:", error);
    } else {
      console.log("Resultado registrado:", data);
    }
  }

  async listarMensajes()
  {
    // Corrección del paréntesis extra en la consulta original
    const { data, error } = await this.sb.supabase.from("mensajes").select("id_mensaje, id_usuario, usuarios (nombre), mensaje, fecha");
    
    if (error) {
      console.error('Error al listar mensajes:', error);
      return [];
    }
    
    console.log("Mensajes cargados:", data);
    return data as any[];
  }

  async insertarMensaje(mensaje: string, id_usuario: number) {
    try {
      console.log("Insertando mensaje para usuario ID:", id_usuario);
      const { data, error } = await this.sb.supabase
        .from("mensajes")
        .insert({ mensaje: mensaje, id_usuario: id_usuario });
        
      if (error) {
        console.error("Error al insertar mensaje:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error al insertar mensaje:', error);
      throw error;
    }
  }
}
