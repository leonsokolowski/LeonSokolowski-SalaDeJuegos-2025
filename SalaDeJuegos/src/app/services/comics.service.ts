import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComicsService {
  httpClient = inject(HttpClient); 
  constructor() { }

   traerPersonaje(id_personaje: number) 
   {
        return this.httpClient.get<any>("/api/" + id_personaje);
   }
}
