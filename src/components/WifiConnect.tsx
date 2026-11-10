"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { WIFI_SEGURANCA_LABEL, wifiPayload } from "@/lib/wifi";

type Props = {
  nome: string;
  ssid: string;
  senha: string | null;
  seguranca: "WPA" | "WEP" | "ABERTA";
};

const IconWifi = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 9.5a15 15 0 0 1 19 0" />
    <path d="M5.8 13a10.5 10.5 0 0 1 12.4 0" />
    <path d="M9 16.4a6 6 0 0 1 6 0" />
    <circle cx="12" cy="19.6" r="1.35" fill="currentColor" stroke="none" />
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4l16 16" />
    <path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.4 17.4 0 0 1-3.3 4.2M6.2 8.3A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5c1.4 0 2.7-.3 3.8-.8" />
    <path d="M9.5 9.7a3.2 3.2 0 0 0 4.8 4.5" />
  </svg>
);

const IconCopy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4.5 12.5 5 5L20 6.5" />
  </svg>
);

const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3 5 6v6c0 4.4 3 7.7 7 9 4-1.3 7-4.6 7-9V6z" />
    <path d="m9.5 12 2 2 3.5-3.5" />
  </svg>
);

const IconQr = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.4" /><rect x="14" y="3" width="7" height="7" rx="1.4" />
    <rect x="3" y="14" width="7" height="7" rx="1.4" />
    <path d="M14 14h3v3h-3z" fill="currentColor" stroke="none" />
    <path d="M18.5 14h2.5M14 18.5v2.5M18.5 18.5h2.5" />
  </svg>
);

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

export default function WifiConnect({ nome, ssid, senha, seguranca }: Props) {
  const aberta = seguranca === "ABERTA";
  const [showSenha, setShowSenha] = useState(false);
  const [copied, setCopied] = useState<"senha" | "ssid" | null>(null);
  const [directQr, setDirectQr] = useState<string | null>(null);
  const [showDirect, setShowDirect] = useState(false);

  // Gera o QR direto (payload WIFI:) somente quando solicitado
  useEffect(() => {
    if (!showDirect || directQr) return;
    QRCode.toDataURL(wifiPayload({ ssid, senha, seguranca }), {
      width: 300,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#191927", light: "#ffffff" },
    })
      .then(setDirectQr)
      .catch(() => setDirectQr(null));
  }, [showDirect, directQr, ssid, senha, seguranca]);

  const onCopy = async (text: string, kind: "senha" | "ssid") => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <main className="wifi-page">
      <div className="wifi-card">
        {/* Cabeçalho */}
        <div className="wifi-hero">
          <div className="wifi-big-icon"><IconWifi size={40} /></div>
          <h1 className="wifi-title">{nome}</h1>
          <p className="wifi-sub">Conecte-se à nossa rede Wi-Fi. É rápido e grátis.</p>
        </div>

        {/* Rede */}
        <div className="wifi-block">
          <div className="wifi-block-head">
            <span className="wifi-label">Nome da rede</span>
            {!aberta && (
              <span className="wifi-chip"><IconShield />{WIFI_SEGURANCA_LABEL[seguranca]}</span>
            )}
            {aberta && <span className="wifi-chip wifi-chip-open">Rede aberta</span>}
          </div>
          <div className="wifi-value-row">
            <code className="wifi-value">{ssid}</code>
            <button className="wifi-icon-btn" onClick={() => onCopy(ssid, "ssid")} aria-label="Copiar nome da rede">
              {copied === "ssid" ? <IconCheck /> : <IconCopy />}
            </button>
          </div>
        </div>

        {/* Senha */}
        {aberta ? (
          <div className="wifi-open-note">
            Esta rede <strong>não tem senha</strong> — selecione “{ssid}” nas redes Wi-Fi do seu aparelho e conecte.
          </div>
        ) : (
          <div className="wifi-block">
            <span className="wifi-label">Senha</span>
            <div className="wifi-value-row">
              <code className="wifi-value wifi-senha">
                {showSenha ? senha : "•".repeat(Math.max(8, Math.min(senha?.length ?? 8, 24)))}
              </code>
              <button className="wifi-icon-btn" onClick={() => setShowSenha((v) => !v)}
                aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}>
                {showSenha ? <IconEyeOff /> : <IconEye />}
              </button>
              <button className="wifi-icon-btn" onClick={() => onCopy(senha ?? "", "senha")} aria-label="Copiar senha">
                {copied === "senha" ? <IconCheck /> : <IconCopy />}
              </button>
            </div>
            <button className="wifi-cta" onClick={() => onCopy(senha ?? "", "senha")}>
              {copied === "senha" ? <><IconCheck /> Senha copiada!</> : <><IconCopy /> Copiar senha</>}
            </button>
          </div>
        )}

        {/* Passo a passo */}
        <div className="wifi-steps">
          <div className="wifi-step">
            <span className="wifi-step-num">1</span>
            <div><b>Abra o Wi-Fi</b><p>Ajustes → Wi-Fi (ou o ícone na barra superior).</p></div>
          </div>
          <div className="wifi-step">
            <span className="wifi-step-num">2</span>
            <div><b>Toque na rede “{ssid.length > 18 ? ssid.slice(0, 18) + "…" : ssid}”</b><p>Ela aparece na lista de redes disponíveis.</p></div>
          </div>
          <div className="wifi-step">
            <span className="wifi-step-num">3</span>
            <div><b>{aberta ? "Conecte" : "Cole a senha copiada"}</b><p>{aberta ? "Sem senha — toque e pronto." : "Use o botão “Copiar senha” acima e cole no campo."}</p></div>
          </div>
        </div>

        {/* QR direto (payload nativo do Wi-Fi) */}
        <div className="wifi-direct">
          <button className="wifi-direct-toggle" onClick={() => setShowDirect((v) => !v)} aria-expanded={showDirect}>
            <IconQr />
            {showDirect ? "Ocultar QR de conexão rápida" : "Prefere conectar sem digitar?"}
          </button>
          {showDirect && (
            <div className="wifi-direct-body">
              {directQr ? (
                <img src={directQr} alt="QR para conectar ao Wi-Fi diretamente" width={200} height={200} />
              ) : (
                <div className="wifi-direct-placeholder">Gerando…</div>
              )}
              <p>Escaneie com <strong>outro aparelho</strong> para conectá-lo direto nesta rede (Android e iPhone reconhecem este QR nativamente).</p>
            </div>
          )}
        </div>

        <p className="wifi-foot">Dificuldade para conectar? Fale com um atendente.</p>
      </div>
    </main>
  );
}
