import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  registroForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  private credencialesAdmin1 = {
    correo: 'admin1@example.com',
    contraseña: 'Administrador1'
  };

  private credencialesAdmin2 = {
    correo: 'admin2@example.com',
    contraseña: 'Administrador2'
  };

  private credencialesAdmin3 = {
    correo: 'admin3@example.com',
    contraseña: 'Administrador3'
  };

  constructor() {
    this.registroForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/[A-Z]/), Validators.pattern(/[0-9]/)]],
    });
  }

  get f() {
    return this.registroForm.controls;
  }

  completarAdmin1() {
    this.registroForm.setValue({
      correo: this.credencialesAdmin1.correo,
      contraseña: this.credencialesAdmin1.contraseña
    });
  }

  completarAdmin2() {
    this.registroForm.setValue({
      correo: this.credencialesAdmin2.correo,
      contraseña: this.credencialesAdmin2.contraseña
    });
  }

  completarAdmin3() {
    this.registroForm.setValue({
      correo: this.credencialesAdmin3.correo,
      contraseña: this.credencialesAdmin3.contraseña
    });
  }

  limpiarCampos() {
    this.registroForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  async ingresar() {
    if (this.registroForm.invalid) {
      return;
    }
  
    const { correo, contraseña } = this.registroForm.value;
  
    try {
      const result = await this.authService.iniciarSesion(correo, contraseña);
      
      if (result && result.error) {
        if (result.error.message === 'Invalid login credentials') {
          this.errorMessage = 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
        } else {
          this.errorMessage = `Error: ${result.error.message}`;
        }
        return;
      }
      this.successMessage = 'Sesión iniciada correctamente.';
    } catch (error: any) {
      console.error('Error en inicio de sesión:', error);
      this.errorMessage = 'Hubo un error al iniciar sesión. Por favor, intenta nuevamente.';
    }
  }
}