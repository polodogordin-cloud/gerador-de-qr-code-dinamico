"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function QrMark({ size = 30 }: { size?: number }) {
  return (
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
}

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Não foi possível entrar. Tente novamente.");
        setLoading(false);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Falha de conexão. Verifique a internet e tente de novo.");
      setLoading(false);
    }
  }

  return (
    <main className="login-wrap">
      <div className="login-card">
        <div className="login-badge">
          <QrMark size={34} />
        </div>
        <h1>Plaquinhas QR</h1>
        <p className="sub">
          Painel dos seus QR Codes dinâmicos.
          <br />
          Entre com a senha para gerenciar as plaquinhas.
        </p>

        <form onSubmit={onSubmit}>
          {error && <div className="login-error" role="alert">{error}</div>}
          <div className="field">
            <label htmlFor="senha">Senha do painel</label>
            <input
              id="senha"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: "center" }}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="login-foot">
          Acesso restrito ao responsável pelas plaquinhas.
        </p>
      </div>
    </main>
  );
}
