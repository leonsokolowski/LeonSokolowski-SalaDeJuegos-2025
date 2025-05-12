import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  auth = inject(AuthService)
  db = inject(DatabaseService)
  usuario: any = null; 
  
  async ngOnInit(): Promise<void> {
    setTimeout(async () => {
      const resultado = await this.db.traerUsuarioActual();
      this.usuario = resultado && resultado.length > 0 ? resultado[0] : null;
    }, 20);
  }
  logOut()
  {
    this.auth.cerrarSesion();
  }
}
