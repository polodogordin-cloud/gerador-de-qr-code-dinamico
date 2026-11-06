import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { passwordMatches, sessionCookieName, sessionCookieOptions } from "@/lib/session";

export async function POST(request: Request) {
  let body: { password?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD não configurada no servidor." },
      { status: 500 }
    );
  }

  if (!passwordMatches(password)) {
    // Pequeno atraso para dificultar força bruta
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const store = await cookies();
  const opts = sessionCookieOptions();
  store.set(opts.name, opts.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: opts.secure,
    path: "/",
    maxAge: opts.maxAge,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(sessionCookieName());
  return NextResponse.json({ ok: true });
}
