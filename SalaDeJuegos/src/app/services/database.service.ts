import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Usuario } from '../classes/usuario';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  sb = inject(SupabaseService)

  async listarUsuarios()
  {
    const {data, error} = await this.sb.supabase.from("usuarios").select("*");
    const usuarios = data as Usuario[];
    console.log(usuarios)
    return usuarios;
  }

  async registrarUsuario(usuario : Usuario)
  {
    const {data, error} = await this.sb.supabase.from("usuarios").insert(usuario);
    console.log(data)
  }
}
