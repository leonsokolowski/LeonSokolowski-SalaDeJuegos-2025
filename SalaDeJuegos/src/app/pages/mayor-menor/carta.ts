export type Palo = 'espadas' | 'bastos' | 'oros' | 'copas';

export interface Carta {
  numero: number; // 1 a 12
  palo: Palo;
}
