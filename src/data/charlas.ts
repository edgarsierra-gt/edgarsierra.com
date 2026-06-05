export interface Charla {
  title: string;
  event: string;
  organization: string;
  year: number;
  type: 'Taller' | 'Conferencia' | 'Ponencia';
  description?: string;
  slides?: string;
}

export const CHARLAS: Charla[] = [
  {
    title: 'Taller de Análisis de Datos y Series de Tiempo',
    event: 'Congreso Regional de Ingeniería',
    organization: 'CUNOR-USAC',
    year: 2024,
    type: 'Taller',
    description:
      'Taller práctico sobre análisis exploratorio de datos y modelado de series de tiempo con Python, orientado a ingenieros y estudiantes de la región noroccidental de Guatemala.',
  },
];
