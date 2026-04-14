export const ATLETICAS = {
  '1ª Divisão': [
    { nome: 'Alcateia',     curso: 'Medicina', instituicao: 'UFC Sobral' },
    { nome: 'Audácia',      curso: 'Medicina', instituicao: 'Unichristus' },
    { nome: 'Espartana',    curso: 'Medicina', instituicao: 'IDOMED Juazeiro' },
    { nome: 'Fulminante',   curso: 'Medicina', instituicao: 'UECE' },
    { nome: 'Ira',          curso: 'Medicina', instituicao: 'UNINTA Sobral' },
    { nome: 'Kariris',      curso: 'Medicina', instituicao: 'UFCA Barbalha' },
    { nome: 'Selvagem',     curso: 'Medicina', instituicao: 'UFC Fortaleza' },
    { nome: 'Tenebrosa',    curso: 'Medicina', instituicao: 'UNIFOR' },
  ],
  '2ª Divisão': [
    { nome: 'Invocada',     curso: 'Medicina', instituicao: 'IDOMED Quixadá' },
    { nome: 'Caçadora',     curso: 'Medicina', instituicao: 'UECE Crateús' },
    { nome: 'Perversa',     curso: 'Medicina', instituicao: 'UNINTA Itapipoca' },
    { nome: 'Aniquiladora', curso: 'Medicina', instituicao: 'IDOMED Iguatu' },
  ],
  'Convidadas': [
    { nome: 'Voraz',         curso: 'Medicina', instituicao: 'F5 Sobral' },
    { nome: 'Tirana',        curso: 'Medicina', instituicao: 'UECE Quixeramobim' },
    { nome: 'Exterminadora', curso: 'Medicina', instituicao: 'URCA Cariri' },
  ],
} as const;

export const TODAS_ATLETICAS = Object.values(ATLETICAS).flat();

export const CARGOS = [
  'Presidente',
  'Diretor',
  'Organizador',
  'Técnico',
  'Esportista / Jogador',
  'Egresso',
  'Acadêmico',
];
