import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { HomeComponent } from './pages/home/home.component';
import { QuienSoyComponent } from './pages/quien-soy/quien-soy.component';
import { ErrorComponent } from './pages/error/error.component';

export const routes: Routes = [
    {path: "", redirectTo: "login", pathMatch: "full"},
    {path: "login", component: LoginComponent, title: "Ingreso"},
    {path: "registro", component: RegistroComponent, title: "Registro"},
    {path: "home", component: HomeComponent, title: "Pagina Principal"},
    {path: "quien-soy", component: QuienSoyComponent, title: "Quien Soy"},
    {path: "**", component: ErrorComponent, title: "ERROR"},
];
