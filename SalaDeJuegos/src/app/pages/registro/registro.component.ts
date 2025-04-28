import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../classes/usuario';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  imports: [ReactiveFormsModule, CommonModule] // Importa los módulos necesarios aquí
})
export class RegistroComponent {
  private authService = inject(AuthService);
  private databaseService = inject(DatabaseService);
  private fb = inject(FormBuilder);

  registroForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor() {
    this.registroForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/[A-Z]/), Validators.pattern(/[0-9]/)]],
      confirmarContraseña: ['', [Validators.required]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      edad: ['', [Validators.required, Validators.min(18)]]
    });
  }

  get f() {
    return this.registroForm.controls;
  }

  // Método para verificar si el usuario ya existe en la base de datos
  async verificarUsuarioExistente(): Promise<boolean> {
    const { correo, nombre, apellido } = this.registroForm.value;
    const usuarios = await this.databaseService.listarUsuarios();
    return usuarios.some(
      (usuario: Usuario) => usuario.correo === correo || (usuario.nombre === nombre && usuario.apellido === apellido)
    );
  }

  // Método para crear la cuenta
  async registrar() {
    if (this.registroForm.invalid) {
      return;
    }
  
    const { correo, contraseña, confirmarContraseña, nombre, apellido, edad } = this.registroForm.value;
  
    // Verificar que las contraseñas coincidan
    if (contraseña !== confirmarContraseña) {
      this.registroForm.controls['confirmarContraseña'].setErrors({ noMatch: true });  // Añadir error a la confirmación de la contraseña
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }
  
    // Verificar si el usuario ya existe
    const usuarioExistente = await this.verificarUsuarioExistente();
    if (usuarioExistente) {
      this.registroForm.controls['correo'].setErrors({ alreadyExists: true }); // Añadir error al correo si el usuario ya existe
      this.errorMessage = 'Ya existe un usuario con ese correo o combinación de nombre y apellido.';
      return;
    }
  
    try {
      // Crear cuenta en Supabase
      await this.authService.crearCuenta(correo, contraseña);
      // Agregar usuario a la base de datos
      const usuario: Usuario = { correo, nombre, apellido, edad };
      await this.databaseService.registrarUsuario(usuario);
      this.successMessage = 'Usuario registrado exitosamente.';
    } catch (error) {
      this.errorMessage = 'Hubo un error al registrar la cuenta.';
    }
  }
}
