"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Plaquinha } from "@/lib/types";
import {
  plaqueUrl,
  qrDataUrl,
  qrSvgString,
  downloadDataUrl,
  downloadTextFile,
  safeFilename,
} from "@/lib/qr";

/* ============================== Ícones ============================== */

type IconProps = { size?: number };
const I = ({ children, size = 17 }: IconProps & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const IconPlus = (p: IconProps) => <I {...p}><path d="M12 5v14M5 12h14" /></I>;
const IconSearch = (p: IconProps) => <I {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></I>;
const IconCopy = (p: IconProps) => <I {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></I>;
const IconExternal = (p: IconProps) => <I {...p}><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M19 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></I>;
const IconDownload = (p: IconProps) => <I {...p}><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M4 21h16" /></I>;
const IconPrint = (p: IconProps) => <I {...p}><path d="M7 8V3h10v5" /><path d="M7 17H4a1 1 0 0 1-1-1v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6a1 1 0 0 1-1 1h-3" /><path d="M7 14h10v7H7z" /></I>;
const IconPencil = (p: IconProps) => <I {...p}><path d="M17 3a2.8 2.8 0 1 1 4 4L8 20l-5 1 1-5Z" /></I>;
const IconPower = (p: IconProps) => <I {...p}><path d="M12 3v8" /><path d="M6.3 6.5a8 8 0 1 0 11.4 0" /></I>;
const IconLock = (p: IconProps) => <I {...p}><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></I>;
const IconUnlock = (p: IconProps) => <I {...p}><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 7.7-1.5" /></I>;
const IconArchive = (p: IconProps) => <I {...p}><rect x="2" y="4" width="20" height="5" rx="1.5" /><path d="M4.5 9v9a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9" /><path d="M10 13h4" /></I>;
const IconUnarchive = (p: IconProps) => <I {...p}><rect x="2" y="4" width="20" height="5" rx="1.5" /><path d="M4.5 9v9a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9" /><path d="M12 18v-6" /><path d="m9.5 14.5 2.5-2.5 2.5 2.5" /></I>;
const IconTrash = (p: IconProps) => <I {...p}><path d="M4 7h16" /><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /><path d="m6.5 7 1.2 13a2 2 0 0 0 2 1.9h4.6a2 2 0 0 0 2-1.9L17.5 7" /></I>;
const IconGear = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h0a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v0a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" /></I>;
const IconLogout = (p: IconProps) => <I {...p}><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></I>;
const IconScan = (p: IconProps) => <I {...p}><path d="M3 8V5a2 2 0 0 1 2-2h3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M21 16v3a2 2 0 0 1-2 2h-3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><circle cx="12" cy="12" r="3.2" /></I>;
const IconCheck = (p: IconProps) => <I {...p}><path d="m4.5 12.5 5 5L20 6.5" strokeWidth="2.4" /></I>;
const IconX = (p: IconProps) => <I {...p}><path d="M6 6l12 12M18 6 6 18" /></I>;
const IconLink = (p: IconProps) => <I {...p}><path d="M10 13.5a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 5" /><path d="M14 10.5a5 5 0 0 0-7.07 0L4.1 13.33a5 5 0 0 0 7.07 7.07l1.33-1.4" /></I>;
const IconFile = (p: IconProps) => <I {...p}><path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" /><path d="M13 3v6h6" /></I>;
const IconGrid = (p: IconProps) => <I {...p}><rect x="3" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" /></I>;
const IconInfo = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 7.5h.01" /></I>;

const QrMark = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2.5" y="2.5" width="7.5" height="7.5" rx="1.4" stroke="#fff" strokeWidth="1.8" />
    <rect x="5.2" y="5.2" width="2.1" height="2.1" rx="0.5" fill="#fff" />
    <rect x="14" y="2.5" width="7.5" height="7.5" rx="1.4" stroke="#fff" strokeWidth="1.8" />
    <rect x="16.7" y="5.2" width="2.1" height="2.1" rx="0.5" fill="#fff" />
    <rect x="2.5" y="14" width="7.5" height="7.5" rx="1.4" stroke="#fff" strokeWidth="1.8" />
    <rect x="5.2" y="16.7" width="2.1" height="2.1" rx="0.5" fill="#fff" />
    <path d="M14 14h3v3h-3z" fill="#fff" />
    <path d="M18.5 14h3v3h-3z" fill="#fff" />
    <path d="M14 18.5h3v3h-3z" fill="#fff" />
    <path d="M18.5 18.5h3v3h-3z" fill="#fff" />
  </svg>
);

/* ============================== Utils ============================== */

type Filter = "todas" | "ativas" | "inativas" | "arquivadas";
type ToastData = { msg: string; kind: "ok" | "error" } | null;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) +
    " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

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

/* ============================== Componente principal ============================== */

export default function Panel({
  initialPlaques,
  initialBaseUrl,
}: {
  initialPlaques: Plaquinha[];
  initialBaseUrl: string;
}) {
  const [plaques, setPlaques] = useState<Plaquinha[]>(initialPlaques);
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ativas");
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastData>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modais
  const [createOpen, setCreateOpen] = useState(false);
  const [created, setCreated] = useState<Plaquinha | null>(null);
  const [createdQr, setCreatedQr] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Plaquinha | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Plaquinha | null>(null);
  const [printImg, setPrintImg] = useState<string | null>(null);
  const [printPlaque, setPrintPlaque] = useState<Plaquinha | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string, kind: "ok" | "error" = "ok") => {
    setToast({ msg, kind });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  }, []);

  /* ---------- Gera QR thumbnails ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: Record<string, string> = {};
      for (const p of plaques) {
        const key = `${p.slug}|${baseUrl}`;
        try {
          next[key] = await qrDataUrl(plaqueUrl(baseUrl, p.slug), 220);
        } catch (e) {
          console.error("Falha ao gerar QR", e);
        }
        if (cancelled) return;
      }
      if (!cancelled) setQrImages(next);
    })();
    return () => { cancelled = true; };
  }, [plaques, baseUrl]);

  /* ---------- QR da plaquinha recém-criada ---------- */
  useEffect(() => {
    if (!created) { setCreatedQr(null); return; }
    let cancelled = false;
    qrDataUrl(plaqueUrl(baseUrl, created.slug), 480).then((d) => {
      if (!cancelled) setCreatedQr(d);
    });
    return () => { cancelled = true; };
  }, [created, baseUrl]);

  /* ---------- Filtros e estatísticas ---------- */
  const counts = useMemo(() => {
    const ativas = plaques.filter((p) => !p.arquivada && p.ativo).length;
    const inativas = plaques.filter((p) => !p.arquivada && !p.ativo).length;
    const arquivadas = plaques.filter((p) => p.arquivada).length;
    const scans = plaques.reduce((acc, p) => acc + (p.scans || 0), 0);
    return { ativas, inativas, arquivadas, scans, total: plaques.length };
  }, [plaques]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return plaques.filter((p) => {
      if (filter === "ativas" && (p.arquivada || !p.ativo)) return false;
      if (filter === "inativas" && (p.arquivada || p.ativo)) return false;
      if (filter === "arquivadas" && !p.arquivada) return false;
      if (!q) return true;
      return (
        p.nome.toLowerCase().includes(q) ||
        p.destino.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    });
  }, [plaques, search, filter]);

  /* ---------- Ações ---------- */
  const patchPlaque = useCallback(
    async (id: string, payload: Record<string, unknown>, successMsg?: string) => {
      setBusyId(id);
      try {
        const res = await fetch(`/api/plaquinhas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          showToast(data?.error || "Erro ao salvar.", "error");
          return false;
        }
        setPlaques((prev) => prev.map((p) => (p.id === id ? { ...p, ...data.plaquinha } : p)));
        if (successMsg) showToast(successMsg);
        return true;
      } catch {
        showToast("Falha de conexão. Tente de novo.", "error");
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [showToast]
  );

  const toggleAtivo = (p: Plaquinha) =>
    patchPlaque(
      p.id,
      { ativo: !p.ativo },
      !p.ativo ? "Plaquinha ativada." : "Plaquinha desativada. O QR não abre mais."
    );

  const toggleTravada = (p: Plaquinha) =>
    patchPlaque(
      p.id,
      { travada: !p.travada },
      !p.travada ? "Plaquinha travada contra edições." : "Plaquinha destravada."
    );

  const toggleArquivada = (p: Plaquinha) =>
    patchPlaque(
      p.id,
      { arquivada: !p.arquivada },
      !p.arquivada ? "Plaquinha arquivada." : "Plaquinha desarquivada."
    );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setBusyId(target.id);
    try {
      const res = await fetch(`/api/plaquinhas/${target.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data?.error || "Erro ao excluir.", "error");
        return;
      }
      setPlaques((prev) => prev.filter((p) => p.id !== target.id));
      showToast("Plaquinha excluída.");
      setDeleteTarget(null);
    } catch {
      showToast("Falha de conexão. Tente de novo.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const downloadPng = useCallback(
    async (p: Plaquinha) => {
      const url = plaqueUrl(baseUrl, p.slug);
      const dataUrl = await qrDataUrl(url, 1200);
      downloadDataUrl(dataUrl, `${safeFilename(p.nome, p.slug)}-qr.png`);
      showToast("QR Code (PNG) baixado.");
    },
    [baseUrl, showToast]
  );

  const downloadSvg = useCallback(
    async (p: Plaquinha) => {
      const url = plaqueUrl(baseUrl, p.slug);
      const svg = await qrSvgString(url);
      downloadTextFile(svg, `${safeFilename(p.nome, p.slug)}-qr.svg`, "image/svg+xml");
      showToast("QR Code (SVG) baixado.");
    },
    [baseUrl, showToast]
  );

  const copyShortLink = useCallback(
    async (p: Plaquinha) => {
      const ok = await copyText(plaqueUrl(baseUrl, p.slug));
      showToast(ok ? "Link copiado!" : "Não foi possível copiar.", ok ? "ok" : "error");
    },
    [baseUrl, showToast]
  );

  const startPrint = useCallback(
    async (p: Plaquinha) => {
      const url = plaqueUrl(baseUrl, p.slug);
      const img = await qrDataUrl(url, 800);
      setPrintPlaque(p);
      setPrintImg(img);
    },
    [baseUrl]
  );

  useEffect(() => {
    if (!printImg) return;
    const t = setTimeout(() => window.print(), 120);
    const clear = () => {
      setPrintImg(null);
      setPrintPlaque(null);
    };
    window.addEventListener("afterprint", clear, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", clear);
    };
  }, [printImg]);

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  /* ============================== Render ============================== */

  return (
    <>
      {/* ---------- Print area (só aparece na impressão) ---------- */}
      <div className="print-area" aria-hidden="true">
        {printPlaque && printImg && (
          <>
            <img src={printImg} alt={`QR Code de ${printPlaque.nome}`} />
            <div className="print-name">{printPlaque.nome}</div>
            <div className="print-url">{plaqueUrl(baseUrl, printPlaque.slug)}</div>
          </>
        )}
      </div>

      {/* ---------- Top bar ---------- */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-badge"><QrMark size={26} /></div>
            <div>
              <h1>Plaquinhas QR</h1>
              <small>QR Codes Dinâmicos</small>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setSettingsOpen(true)} title="Configurar URL base">
              <IconGear size={16} />
              <span className="hide-sm">URL base</span>
            </button>
            <button className="btn btn-ghost btn-sm" onClick={logout} title="Sair do painel">
              <IconLogout size={16} />
              <span className="hide-sm">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        {/* ---------- Cabeçalho ---------- */}
        <div className="page-head">
          <div>
            <h2>Minhas plaquinhas</h2>
            <p>
              Cada plaquinha tem um QR Code fixo. Você pode <strong>trocar o destino</strong> dele
              quando quiser — sem reimprimir.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => { setCreated(null); setCreateOpen(true); }}>
            <IconPlus size={17} />
            Nova placa
          </button>
        </div>

        {/* ---------- Estatísticas ---------- */}
        <div className="stats">
          <div className="stat">
            <div className="stat-icon scans"><IconScan size={22} /></div>
            <div>
              <b>{counts.scans.toLocaleString("pt-BR")}</b>
              <span>Scans no total</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon ativas"><IconGrid size={20} /></div>
            <div>
              <b>{counts.ativas}</b>
              <span>Plaquinhas ativas</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon arquivadas"><IconArchive size={20} /></div>
            <div>
              <b>{counts.arquivadas}</b>
              <span>Arquivadas</span>
            </div>
          </div>
        </div>

        {/* ---------- Toolbar ---------- */}
        <div className="toolbar">
          <div className="search">
            <IconSearch size={17} />
            <input
              type="text"
              placeholder="Buscar por nome, destino ou código…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar plaquinha"
            />
          </div>
          <div className="chips" role="tablist">
            {([
              ["ativas", "Ativas", counts.ativas],
              ["inativas", "Inativas", counts.inativas],
              ["arquivadas", "Arquivadas", counts.arquivadas],
              ["todas", "Todas", counts.total],
            ] as [Filter, string, number][]).map(([key, label, count]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                className={`chip${filter === key ? " active" : ""}`}
                onClick={() => setFilter(key)}
              >
                {label}
                <span className="count">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ---------- Grid de cards ---------- */}
        {filtered.length === 0 ? (
          <div className="empty">
            <QrMark size={46} />
            <h3>{search ? "Nada encontrado" : "Nenhuma plaquinha aqui ainda"}</h3>
            <p>
              {search
                ? "Tente outro termo de busca ou mude o filtro."
                : filter === "arquivadas"
                ? "Plaquinhas arquivadas aparecem aqui."
                : "Crie sua primeira plaquinha e gere um QR Code dinâmico."}
            </p>
            {!search && (
              <button className="btn btn-primary" onClick={() => { setCreated(null); setCreateOpen(true); }}>
                <IconPlus size={17} />
                Criar plaquinha
              </button>
            )}
          </div>
        ) : (
          <div className="grid">
            {filtered.map((p) => {
              const shortUrl = plaqueUrl(baseUrl, p.slug);
              const qr = qrImages[`${p.slug}|${baseUrl}`];
              const busy = busyId === p.id;
              const host = (() => {
                try { return new URL(p.destino).hostname.replace(/^www\./, ""); }
                catch { return p.destino; }
              })();

              return (
                <article
                  key={p.id}
                  className={`card${p.arquivada ? " is-arquivada" : ""}${!p.ativo && !p.arquivada ? " is-inativa" : ""}`}
                >
                  <div className="card-head">
                    <div>
                      <h3 className="card-title">{p.nome}</h3>
                      <p className="card-sub">Criada em {formatDate(p.criado_em)}</p>
                    </div>
                    <div className="badges">
                      {p.arquivada ? (
                        <span className="badge badge-arquivada"><span className="badge-dot" />Arquivada</span>
                      ) : p.ativo ? (
                        <span className="badge badge-ativa"><span className="badge-dot" />Ativa</span>
                      ) : (
                        <span className="badge badge-inativa"><span className="badge-dot" />Inativa</span>
                      )}
                      {p.travada && (
                        <span className="badge badge-travada"><IconLock size={11} />Travada</span>
                      )}
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="qr-well">
                      {qr ? (
                        <img src={qr} alt={`QR Code de ${p.nome}`} width={102} height={102} />
                      ) : (
                        <div style={{ width: 102, height: 102 }} aria-hidden="true" />
                      )}
                    </div>

                    <div className="card-info">
                      <div className="link-chip" title={shortUrl}>
                        <IconLink size={13} />
                        <code>/r/{p.slug}</code>
                        <button onClick={() => copyShortLink(p)} aria-label="Copiar link do QR">
                          <IconCopy size={14} />
                        </button>
                      </div>

                      <div className="dest">
                        <b>Destino atual · {host}</b>
                        <a href={p.destino} target="_blank" rel="noopener noreferrer">
                          {p.destino}
                        </a>
                      </div>

                      <div className="scans-row">
                        <span className="scans-num"><IconScan size={14} /> {p.scans.toLocaleString("pt-BR")} scans</span>
                        {p.ultimo_scan && <span>último: {formatDate(p.ultimo_scan)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="card-foot">
                    <button
                      className="btn-destino"
                      onClick={() => setEditTarget(p)}
                      disabled={busy}
                      title={p.travada ? "Destrave para editar" : "Trocar o destino do QR Code"}
                    >
                      <IconPencil size={14} />
                      Trocar destino
                    </button>

                    <button className="icon-btn" onClick={() => toggleAtivo(p)} disabled={busy}
                      aria-label={p.ativo ? "Desativar" : "Ativar"}>
                      <IconPower size={16} />
                      <span className="tip">{p.ativo ? "Desativar" : "Ativar"}</span>
                    </button>
                    <button className="icon-btn" onClick={() => toggleTravada(p)} disabled={busy}
                      aria-label={p.travada ? "Destravar" : "Travar"}>
                      {p.travada ? <IconUnlock size={16} /> : <IconLock size={16} />}
                      <span className="tip">{p.travada ? "Destravar edição" : "Travar edição"}</span>
                    </button>
                    <button className="icon-btn" onClick={() => toggleArquivada(p)} disabled={busy}
                      aria-label={p.arquivada ? "Desarquivar" : "Arquivar"}>
                      {p.arquivada ? <IconUnarchive size={16} /> : <IconArchive size={16} />}
                      <span className="tip">{p.arquivada ? "Desarquivar" : "Arquivar"}</span>
                    </button>

                    <span className="spacer" />

                    <button className="icon-btn" onClick={() => window.open(shortUrl, "_blank", "noopener")}
                      aria-label="Testar redirecionamento">
                      <IconExternal size={16} />
                      <span className="tip">Testar link</span>
                    </button>
                    <button className="icon-btn" onClick={() => downloadPng(p)} aria-label="Baixar PNG">
                      <IconDownload size={16} />
                      <span className="tip">Baixar PNG</span>
                    </button>
                    <button className="icon-btn" onClick={() => downloadSvg(p)} aria-label="Baixar SVG">
                      <IconFile size={16} />
                      <span className="tip">Baixar SVG</span>
                    </button>
                    <button className="icon-btn" onClick={() => startPrint(p)} aria-label="Imprimir QR Code">
                      <IconPrint size={16} />
                      <span className="tip">Imprimir</span>
                    </button>
                    <button className="icon-btn danger" onClick={() => setDeleteTarget(p)} disabled={busy || p.travada}
                      aria-label="Excluir">
                      <IconTrash size={16} />
                      <span className="tip">{p.travada ? "Travada — não exclui" : "Excluir"}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* ============================== Modais ============================== */}

      {/* ---- Criar ---- */}
      {createOpen && (
        <CreateModal
          baseUrl={baseUrl}
          created={created}
          createdQr={createdQr}
          onClose={() => { setCreateOpen(false); setCreated(null); }}
          onCreated={(p) => {
            setPlaques((prev) => [p, ...prev]);
            setCreated(p);
          }}
          onCopy={copyShortLink}
          onDownloadPng={downloadPng}
          onDownloadSvg={downloadSvg}
        />
      )}

      {/* ---- Editar destino ---- */}
      {editTarget && (
        <EditModal
          plaque={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={async (payload) => {
            const ok = await patchPlaque(editTarget.id, payload, "Pronto! O QR Code impresso já aponta para o novo destino.");
            if (ok) setEditTarget(null);
          }}
        />
      )}

      {/* ---- Configurações (URL base) ---- */}
      {settingsOpen && (
        <SettingsModal
          baseUrl={baseUrl}
          onClose={() => setSettingsOpen(false)}
          onSave={async (newBase) => {
            try {
              const res = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ base_url: newBase }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                showToast(data?.error || "Erro ao salvar.", "error");
                return false;
              }
              setBaseUrl(data.settings.base_url.replace(/\/+$/, ""));
              showToast("URL base atualizada.");
              return true;
            } catch {
              showToast("Falha de conexão. Tente de novo.", "error");
              return false;
            }
          }}
        />
      )}

      {/* ---- Excluir ---- */}
      {deleteTarget && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Excluir plaquinha"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="modal">
            <div className="modal-head">
              <h3><IconTrash size={19} /> Excluir plaquinha</h3>
              <button className="icon-btn" onClick={() => setDeleteTarget(null)} aria-label="Fechar">
                <IconX size={17} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, lineHeight: 1.55 }}>
                Excluir <strong>“{deleteTarget.nome}”</strong> (<code>/r/{deleteTarget.slug}</code>)?
                Essa ação é permanente: o QR Code impresso para de funcionar e os scans acumulados são perdidos.
              </p>
              <div className="warn-callout">
                Prefira <strong>arquivar</strong> se quiser só tirar o QR do ar temporariamente.
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={busyId === deleteTarget.id}>
                {busyId === deleteTarget.id ? "Excluindo…" : "Excluir definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Toast ---- */}
      <div className={`toast${toast ? " show" : ""}${toast?.kind === "error" ? " error" : ""}`} role="status">
        {toast?.msg ?? ""}
      </div>
    </>
  );
}

/* ============================== Modal: criar ============================== */

function CreateModal({
  baseUrl,
  created,
  createdQr,
  onClose,
  onCreated,
  onCopy,
  onDownloadPng,
  onDownloadSvg,
}: {
  baseUrl: string;
  created: Plaquinha | null;
  createdQr: string | null;
  onClose: () => void;
  onCreated: (p: Plaquinha) => void;
  onCopy: (p: Plaquinha) => void;
  onDownloadPng: (p: Plaquinha) => void;
  onDownloadSvg: (p: Plaquinha) => void;
}) {
  const [nome, setNome] = useState("");
  const [destino, setDestino] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/plaquinhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, destino }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Erro ao criar. Verifique os dados.");
        setLoading(false);
        return;
      }
      onCreated(data.plaquinha as Plaquinha);
    } catch {
      setError("Falha de conexão. Tente de novo.");
      setLoading(false);
    }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Nova plaquinha"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-lg">
        {!created ? (
          <>
            <div className="modal-head">
              <h3><IconPlus size={19} /> Nova plaquinha</h3>
              <button className="icon-btn" onClick={onClose} aria-label="Fechar"><IconX size={17} /></button>
            </div>
            <form onSubmit={onSubmit}>
              <div className="modal-body">
                {error && <div className="warn-callout" role="alert" style={{ color: "var(--red)", background: "var(--red-soft)", borderColor: "#f6c9c9" }}>{error}</div>}
                <div className="field">
                  <label htmlFor="novo-nome">Nome da plaquinha</label>
                  <input id="novo-nome" type="text" autoFocus maxLength={120}
                    placeholder="Ex.: Placa de Avaliação do Google"
                    value={nome} onChange={(e) => setNome(e.target.value)} />
                  <p className="hint">Só para você identificar — o cliente não vê.</p>
                </div>
                <div className="field">
                  <label htmlFor="novo-destino">Destino (para onde o QR abre hoje)</label>
                  <input id="novo-destino" type="text" required inputMode="url"
                    placeholder="Ex.: https://www.instagram.com/suapagina"
                    value={destino} onChange={(e) => setDestino(e.target.value)} />
                  <p className="hint">Pode trocar quando quiser depois — <strong>sem reimprimir a plaquinha</strong>.</p>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Criando…" : "Criar QR Code"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="modal-head">
              <h3><IconCheck size={19} /> Plaquinha criada!</h3>
              <button className="icon-btn" onClick={onClose} aria-label="Fechar"><IconX size={17} /></button>
            </div>
            <div className="modal-body">
              <div className="created-wrap">
                <h4>{created.nome}</h4>
                <p>Aponte a câmera para testar, baixe e mande para a gráfica.</p>
                <div className="created-qr">
                  {createdQr ? <img src={createdQr} alt="QR Code" /> : <span>Gerando…</span>}
                </div>
                <div className="link-chip" style={{ maxWidth: 320, margin: "0 auto" }}>
                  <IconLink size={13} />
                  <code>{plaqueUrl(baseUrl, created.slug)}</code>
                  <button onClick={() => onCopy(created)} aria-label="Copiar link"><IconCopy size={14} /></button>
                </div>
              </div>
            </div>
            <div className="modal-foot" style={{ flexWrap: "wrap" }}>
              <button className="btn btn-ghost" onClick={() => onDownloadSvg(created)}>
                <IconFile size={15} /> SVG
              </button>
              <button className="btn btn-ghost" onClick={() => onDownloadPng(created)}>
                <IconDownload size={15} /> PNG
              </button>
              <button className="btn btn-primary" onClick={onClose}>Concluir</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================== Modal: editar ============================== */

function EditModal({
  plaque,
  onClose,
  onSave,
}: {
  plaque: Plaquinha;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [nome, setNome] = useState(plaque.nome);
  const [destino, setDestino] = useState(plaque.destino);
  const [loading, setLoading] = useState(false);
  const locked = plaque.travada;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSave({ nome, destino });
    setLoading(false);
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Trocar destino"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <h3><IconPencil size={18} /> Trocar destino</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar"><IconX size={17} /></button>
        </div>
        {locked ? (
          <>
            <div className="modal-body">
              <div className="warn-callout" style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <IconLock size={16} />
                <span>
                  <strong>“{plaque.nome}” está travada.</strong><br />
                  Feche esta janela e clique no cadeado do card para destravar antes de editar.
                </span>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-primary" onClick={onClose}>Entendi</button>
            </div>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              <div className="callout">
                <IconInfo size={16} />
                <span>
                  Ao salvar, o QR Code <strong>que já está impresso</strong> passa a abrir o novo destino
                  imediatamente. Nada precisa ser reimpresso.
                </span>
              </div>
              <div className="field">
                <label htmlFor="edit-nome">Nome da plaquinha</label>
                <input id="edit-nome" type="text" maxLength={120}
                  value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="edit-destino">Novo destino</label>
                <input id="edit-destino" type="text" required inputMode="url" autoFocus
                  value={destino} onChange={(e) => setDestino(e.target.value)} />
                <p className="hint">Cole o novo link (site, WhatsApp, Instagram, avaliação do Google…).</p>
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Salvando…" : "Salvar novo destino"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ============================== Modal: settings ============================== */

function SettingsModal({
  baseUrl,
  onClose,
  onSave,
}: {
  baseUrl: string;
  onClose: () => void;
  onSave: (newBase: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState(baseUrl);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = await onSave(value);
    setLoading(false);
    if (ok) onClose();
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Configurações"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <h3><IconGear size={18} /> URL base do QR Code</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar"><IconX size={17} /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="warn-callout">
              <strong>Atenção:</strong> os QR Codes já impressos continuam apontando para o endereço antigo.
              Só altere aqui se você mudou de domínio — caso contrário, mantenha como está.
            </div>
            <div className="field">
              <label htmlFor="base-url">URL base (domínio público do app)</label>
              <input id="base-url" type="text" inputMode="url" value={value}
                onChange={(e) => setValue(e.target.value)} placeholder="https://plaquinhas-qr.vercel.app" />
              <p className="hint">
                Os QR Codes impressos apontam para <code>{value || "…"}/r/código</code>.
              </p>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
