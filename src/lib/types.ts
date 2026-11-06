export type Plaquinha = {
  id: string;
  slug: string;
  nome: string;
  destino: string;
  ativo: boolean;
  scans: number;
  ultimo_scan: string | null;
  arquivada: boolean;
  travada: boolean;
  criado_em: string;
};

export type Settings = {
  id: number;
  base_url: string | null;
};
