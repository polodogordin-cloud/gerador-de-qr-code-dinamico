export type PlaquinhaTipo = "link" | "wifi";

export type WifiSeguranca = "WPA" | "WEP" | "ABERTA";

export type Plaquinha = {
  id: string;
  slug: string;
  nome: string;
  /** URL de destino — null quando tipo === 'wifi' */
  destino: string | null;
  ativo: boolean;
  scans: number;
  ultimo_scan: string | null;
  arquivada: boolean;
  travada: boolean;
  criado_em: string;
  tipo: PlaquinhaTipo;
  wifi_ssid: string | null;
  wifi_senha: string | null;
  wifi_seguranca: WifiSeguranca;
};

export type Settings = {
  id: number;
  base_url: string | null;
};
