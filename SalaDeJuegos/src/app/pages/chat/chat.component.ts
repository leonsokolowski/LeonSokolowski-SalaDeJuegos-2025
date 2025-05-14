import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { DatabaseService } from '../../services/database.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements AfterViewChecked, OnInit {
  sb = inject(SupabaseService);
  db = inject(DatabaseService);
  mensajes = signal<any>([]);
  mensaje = "";
  usuarioActual: any = null;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private shouldScrollToBottom = true;

  constructor() {
  }

  async cargarMensajes() {
    try {
      const data = await this.db.listarMensajes();
      this.mensajes.set([...data]);
      this.shouldScrollToBottom = true;
      console.log('Mensajes cargados:', this.mensajes());
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom && this.messagesContainer) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  async ngOnInit() {
    // Primero obtenemos el usuario actual
    await this.obtenerUsuarioActual();
    
    // Después cargamos los mensajes
    await this.cargarMensajes();
    
    // Configurar el canal de tiempo real para nuevos mensajes
    this.configurarCanalMensajes();
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
        
        // Intento alternativo por si hay algún problema con el correo
        const todosUsuarios = await this.db.listarUsuarios();
        if (todosUsuarios && todosUsuarios.length > 0) {
          // Como solución temporal, tomamos el primer usuario disponible
          this.usuarioActual = todosUsuarios[0];
          console.log('Usuario alternativo establecido:', this.usuarioActual);
        }
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
    }
  }

  configurarCanalMensajes() {
    const canal = this.sb.supabase.channel('table-db-changes');
    canal.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
      },
      async (cambios: any) => {
        console.log('Nuevo mensaje recibido:', cambios);
        
        // Verificar si el mensaje es del usuario actual
        if (this.usuarioActual && cambios.new.id_usuario === this.usuarioActual.id) {
          // Si es del usuario actual, usamos su nombre directamente
          cambios.new.usuarios = { nombre: this.usuarioActual.nombre };
          
          this.mensajes.update((valor_anterior) => {
            return [...valor_anterior, cambios.new];
          });
          this.shouldScrollToBottom = true;
        } else {
          // Si es de otro usuario, necesitamos consultar su nombre
          try {
            const {data} = await this.sb.supabase
              .from("usuarios")
              .select("nombre")
              .eq("id", cambios.new.id_usuario);
            
            if (data && data.length > 0) {
              cambios.new.usuarios = { nombre: data[0].nombre };
              
              this.mensajes.update((valor_anterior) => {
                return [...valor_anterior, cambios.new];
              });
              this.shouldScrollToBottom = true;
            }
          } catch (error) {
            console.error('Error al procesar el nuevo mensaje:', error);
          }
        }
      }
    );
    canal.subscribe();
  }

  async enviar() {
    if (!this.mensaje.trim()) {
      console.log('El mensaje está vacío');
      return;
    }

    if (!this.usuarioActual) {
      console.error('No hay un usuario actual para enviar el mensaje');
      alert('No se ha podido identificar al usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    try {
      console.log('Enviando mensaje como usuario:', this.usuarioActual);
      await this.db.insertarMensaje(this.mensaje, this.usuarioActual.id);
      // Limpiar el campo de mensaje después de enviarlo
      this.mensaje = "";
      this.shouldScrollToBottom = true;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  }
}