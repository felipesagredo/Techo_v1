// Listas blancas de nombres de herramientas y materiales permitidos en todo el sistema.
export const ALLOWED_HERRAMIENTAS = [
  'Martillo',
  'Taladro',
  'Sierra',
  'Pala',
  'Carretilla',
  'Destornillador',
  'Llave inglesa',
  'Huincha',
  'Escalera',
  'Guantes de trabajo',
  'Casco de seguridad'
];

export const ALLOWED_MATERIALES = [
  'Cemento',
  'Arena',
  'Grava',
  'Tablas de Madera',
  'Caja de Clavos',
  'Tornillos',
  'Plancha de zinc',
  'Pintura',
  'Ladrillos',
  'Fierro',
  'Cerámica',
  'Yeso'
];

export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildWhitelistRegex = (allowedNames) => new RegExp(
  `^(${allowedNames.map(escapeRegex).join('|')})$`,
  'i'
);
