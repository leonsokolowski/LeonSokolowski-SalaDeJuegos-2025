import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { HomeComponent } from './pages/home/home.component';
import { QuienSoyComponent } from './pages/quien-soy/quien-soy.component';
import { ErrorComponent } from './pages/error/error.component';
import { AhorcadoComponent } from './pages/ahorcado/ahorcado.component';
import { MayorMenorComponent } from './pages/mayor-menor/mayor-menor.component';
import { QuienEsQuienComponent } from './pages/quien-es-quien/quien-es-quien.component';
import { ChatComponent } from './pages/chat/chat.component';
import { PreguntadosComponent } from './pages/preguntados/preguntados.component';
import { TablasResultadosComponent } from './pages/tablas-resultados/tablas-resultados.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Ingreso' },
  { path: 'registro', component: RegistroComponent, title: 'Registro' },
  { path: 'home', component: HomeComponent, title: 'Pagina Principal' },
  { path: 'quien-soy', component: QuienSoyComponent, title: 'Quien Soy' },
  { path: 'chat', component: ChatComponent, title: 'Chat' },
  { path: 'tablas-resultados', component: TablasResultadosComponent, title: 'Resultados' },
  { path: 'ahorcado', component: AhorcadoComponent, title: 'Ahorcado' },
  { path: 'preguntados', component: PreguntadosComponent, title: 'Preguntados' },
  { path: 'mayor-menor', component: MayorMenorComponent, title: 'Mayor o Menor' },
  { path: 'quien-es-quien', component: QuienEsQuienComponent, title: '¿Quién es quién?'},
  { path: '**', component: ErrorComponent, title: 'ERROR' },
];
