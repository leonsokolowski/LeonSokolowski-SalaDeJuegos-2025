export class Persona
{
    nombre : string;
    genero : string;
    tipo_pelo : string;
    largo_pelo : string;
    color_pelo : string;
    color_ojos : string;
    tono_piel : string;
    usa_anteojos : boolean;


    constructor(nombre:string, genero: string, tipo_pelo: string, largo_pelo : string, color_pelo : string, color_ojos : string, tono_piel : string, usa_anteojos : boolean)
    {
        this.nombre = nombre;
        this.genero = genero;
        this.tipo_pelo = tipo_pelo;
        this.largo_pelo = largo_pelo;
        this.color_pelo = color_pelo;
        this.color_ojos = color_ojos;
        this.tono_piel = tono_piel;
        this.usa_anteojos = usa_anteojos;
    }
}