import { Component, inject } from '@angular/core';
import { GithubService } from '../../services/github.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quien-soy',
  imports: [CommonModule],
  templateUrl: './quien-soy.component.html',
  styleUrl: './quien-soy.component.css'
})
export class QuienSoyComponent {
  githubService = inject(GithubService);
  userData : any;

  nnOnInit() : void
  {
    this.githubService.getUserData().subscribe(
      (data) => this.userData = data,
      (error) => console.error('Error al traer datos de GitHub', error)
    );
  }
}
