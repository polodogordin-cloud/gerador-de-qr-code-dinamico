import { randomInt } from "crypto";

// Alfabeto sem caracteres ambíguos (sem 0/o, 1/l/i)
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function generateSlug(length = 7): string {
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += ALPHABET[randomInt(ALPHABET.length)];
  }
  return slug;
}

/** Normaliza e valida uma URL de destino. Retorna a URL normalizada ou null. */
export function normalizeDestination(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Normaliza a URL base (sem barra no final). */
export function normalizeBaseUrl(input: string): string | null {
  const trimmed = input.trim().replace(/\/+$/, "");
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}
