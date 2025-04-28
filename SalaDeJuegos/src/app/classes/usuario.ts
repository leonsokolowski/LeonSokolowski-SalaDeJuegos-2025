export class Usuario {
    id? : number;
    correo : string;
    nombre : string;
    apellido : string;
    edad: number;

    constructor(correo: string, nombre: string, apellido: string, edad: number)
    {
        this.correo = correo;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
    }


}