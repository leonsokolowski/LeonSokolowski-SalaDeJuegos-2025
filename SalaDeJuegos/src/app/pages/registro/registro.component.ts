import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { inject } from '@angular/core';  // Usamos 'inject' para los servicios
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { Usuario } from '../../classes/usuario';
import { ReactiveFormsModule } from '@angular/forms';  // Necesario para trabajar con formularios reactivos

@Component({
  selector: 'app-registro',
  standalone: true,  // Especificamos que este componente es independiente
  imports: [ReactiveFormsModule],  // Importamos ReactiveFormsModule directamente
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']  // Si tienes un archivo de estilos, lo puedes añadir
})
export class RegistroComponent implements OnInit {
  registroForm!: FormGroup;
  errorMensaje: string = '';

  // Usamos inject() fuera del constructor para las dependencias
  auth = inject(AuthService);  // Inyección de AuthService como 'auth'
  db = inject(DatabaseService);  // Inyección de DatabaseService como 'db'

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Inicializar el formulario con las validaciones necesarias
    this.registroForm = this.fb.group(
      {
        correo: ['', [Validators.required, Validators.email]],
        contraseña: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$')  // al menos una mayúscula y un número
        ]],
        confirmarContraseña: ['', Validators.required],
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        edad: ['', [Validators.required, Validators.min(0)]]
      },
      { validator: this.passwordsIguales }
    );
  }

  // Validador para confirmar que las contraseñas coincidan
  passwordsIguales(formGroup: FormGroup) {
    const pass = formGroup.get('contraseña')?.value;
    const confirmPass = formGroup.get('confirmarContraseña')?.value;
    return pass === confirmPass ? null : { passwordsMismatch: true };
  }

  // Método que verifica si el usuario ya existe
  async usuarioExiste(correo: string, nombre: string, apellido: string): Promise<boolean> {
    try {
      const usuarios: Usuario[] = await this.db.listarUsuarios();
      console.log(usuarios);
      return usuarios.some(u => u.correo === correo || (u.nombre === nombre && u.apellido === apellido));
    } catch (error) {
      console.error('Error al verificar el usuario:', error);
      return false;
    }
  }

  // Método principal al hacer click en "Registrarse"
  async registrarse() {
    this.errorMensaje = '';

    if (this.registroForm.invalid) {
      this.errorMensaje = 'Por favor complete todos los campos correctamente.';
      return;
    }

    const { correo, contraseña, nombre, apellido, edad } = this.registroForm.value;

    // Verificar si el usuario ya existe en la base de datos
    const existe = await this.usuarioExiste(correo, nombre, apellido);
    if (existe) {
      this.errorMensaje = 'El usuario ya existe en la base de datos.';
      return;
    }

    try {
      // Crear la instancia de Usuario
      const nuevoUsuario = new Usuario(correo, nombre, apellido, edad);
      
      // Registrar el nuevo usuario en la base de datos
      await this.db.registrarUsuario(nuevoUsuario);
      
      // Crear la cuenta en el servicio de autenticación
      // await this.auth.crearCuenta(correo, contraseña);
      // Ya no es necesario redirigir, lo maneja el servicio Auth
    } catch (error: any) {
      console.error('Error en el registro:', error);
      this.errorMensaje = 'Ocurrió un error al registrar el usuario. Intente nuevamente.';
    }
  }
}
