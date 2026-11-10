import type { WifiSeguranca } from "./types";

export const WIFI_SEGURANCA_LABEL: Record<WifiSeguranca, string> = {
  WPA: "WPA/WPA2/WPA3",
  WEP: "WEP (legada)",
  ABERTA: "Aberta (sem senha)",
};

export const WIFI_MAX_SSID = 32;
export const WIFI_MAX_SENHA = 63;

export function parseSeguranca(value: unknown): WifiSeguranca | null {
  if (value === "WPA" || value === "WEP" || value === "ABERTA") return value;
  return null;
}

export type WifiValidation =
  | { ok: true; ssid: string; senha: string | null; seguranca: WifiSeguranca }
  | { ok: false; error: string };

/** Valida e normaliza os dados de Wi-Fi de uma placa. */
export function validateWifiInput(input: {
  ssid?: unknown;
  senha?: unknown;
  seguranca?: unknown;
}): WifiValidation {
  const seguranca = parseSeguranca(input.seguranca ?? "WPA");
  if (!seguranca) {
    return { ok: false, error: "Tipo de segurança inválido (use WPA, WEP ou ABERTA)." };
  }

  const ssid = typeof input.ssid === "string" ? input.ssid.trim() : "";
  if (!ssid) {
    return { ok: false, error: "Informe o nome da rede (SSID)." };
  }
  if (ssid.length > WIFI_MAX_SSID) {
    return { ok: false, error: `O nome da rede deve ter no máximo ${WIFI_MAX_SSID} caracteres.` };
  }

  if (seguranca === "ABERTA") {
    return { ok: true, ssid, senha: null, seguranca };
  }

  const senha = typeof input.senha === "string" ? input.senha : "";
  if (!senha.trim()) {
    return { ok: false, error: "Informe a senha da rede." };
  }
  if (senha.length > WIFI_MAX_SENHA) {
    return { ok: false, error: `A senha deve ter no máximo ${WIFI_MAX_SENHA} caracteres.` };
  }
  if (seguranca === "WPA" && senha.length < 8) {
    return { ok: false, error: "Em redes WPA/WPA2/WPA3 a senha tem pelo menos 8 caracteres." };
  }
  return { ok: true, ssid, senha, seguranca };
}

/** Escapa caracteres especiais do payload WIFI: (\ ; , : ") */
export function escapeWifiPayload(value: string): string {
  return value.replace(/([\\;,:""])/g, "\\$1");
}

/**
 * Monta o payload padrão `WIFI:...;` (compatível com câmeras Android/iOS).
 * Usado no QR “direto” exibido na página pública — o QR impresso continua
 * apontando para o link dinâmico.
 */
export function wifiPayload(input: {
  ssid: string;
  senha: string | null;
  seguranca: WifiSeguranca;
}): string {
  const ssid = escapeWifiPayload(input.ssid);
  if (input.seguranca === "ABERTA") {
    return `WIFI:T:nopass;S:${ssid};;`;
  }
  const type = input.seguranca === "WEP" ? "WEP" : "WPA";
  const senha = escapeWifiPayload(input.senha ?? "");
  return `WIFI:T:${type};S:${ssid};P:${senha};;`;
}
