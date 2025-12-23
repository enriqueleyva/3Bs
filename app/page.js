"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ✅ Reemplaza esta lista por tu catálogo real
const PRODUCTOS = [
	"Coca Cola 355ml",
	"Coca Cola Sin Azúcar 355ml",
	"Pepsi 355ml",
	"Agua Natural 600ml",
	"Agua Mineral 600ml",
	"Jugo Naranja 1L",
	"Leche Entera 1L",
	"Pan Blanco",
];

function normaliza(str) {
	return String(str ?? "")
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.trim();
}

async function readResponseSmart(res) {
	const contentType = res.headers.get("content-type") || "";
	if (contentType.includes("application/json")) {
		return await res.json();
	}
	const text = await res.text();
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

export default function Home() {
	const fieldRef = useRef(null);

	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [status, setStatus] = useState("");
	const [loading, setLoading] = useState(false);
	const [lastSent, setLastSent] = useState(null);

	const apiUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

	useEffect(() => {
		if (typeof window === "undefined") return;

		const token =
			localStorage.getItem("auth_token") ||
			(document.cookie || "")
				.split("; ")
				.find((row) => row.startsWith("auth_token="))
				?.split("=")[1];

		if (!token) {
			window.location.href = "/login";
		}
	}, []);
	const suggestions = useMemo(() => {
		const q = normaliza(query);
		if (!q) return [];
		const filtered = PRODUCTOS.filter((p) => normaliza(p).includes(q));
		// Limita sugerencias para no saturar
		return filtered.slice(0, 10);
	}, [query]);

	useEffect(() => {
		const onDocClick = (e) => {
			const el = fieldRef.current;
			if (!el) return;
			if (!el.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener("click", onDocClick);
		return () => document.removeEventListener("click", onDocClick);
	}, []);

	const onPick = (value) => {
		setQuery(value);
		setOpen(false);
	};

	const onRegister = async () => {
		const product = query.trim();
		if (!product) {
			setStatus("Escribe o selecciona un producto antes de registrar.");
			return;
		}

		if (!apiUrl) {
			setStatus(
				"Falta configurar NEXT_PUBLIC_GOOGLE_SCRIPT_URL. Revisa el archivo .env.local (ver README)."
			);
			return;
		}

		setLoading(true);
		setStatus("Enviando...");

		try {
			const payload = {
				producto: product,
				fechaISO: new Date().toISOString(),
				fuente: "nextjs",
			};

			const res = await fetch(apiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				mode: "cors",
			});

			const data = await readResponseSmart(res);

			if (!res.ok) {
				throw new Error(
					typeof data === "string" ? data : JSON.stringify(data, null, 2)
				);
			}

			setLastSent(payload);
			setStatus(
				"✅ Registrado correctamente.\n\nRespuesta del API:\n" +
					(typeof data === "string" ? data : JSON.stringify(data, null, 2))
			);
		} catch (err) {
			setStatus("❌ Error registrando:\n" + (err?.message || String(err)));
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="container">
			<div className="card">
				<h1 className="h1">Registro de productos</h1>
				<p className="p">
					Escribe un producto (con autocompletado) y presiona <b>Registrar</b>{" "}
					para enviarlo a tu Google Apps Script.
				</p>

				<div className="row">
					<div className="field" ref={fieldRef}>
						<input
							className="input"
							value={query}
							placeholder="Ej. Coca Cola 355ml"
							onChange={(e) => {
								setQuery(e.target.value);
								setOpen(true);
							}}
							onFocus={() => setOpen(true)}
							autoComplete="off"
						/>

						{open && suggestions.length > 0 && (
							<div className="suggestions" role="listbox">
								{suggestions.map((s) => (
									<div
										key={s}
										className="suggestion"
										role="option"
										onMouseDown={(e) => {
											// onMouseDown para que no se cierre antes por blur
											e.preventDefault();
											onPick(s);
										}}
									>
										{s}
									</div>
								))}
							</div>
						)}
					</div>

					<button
						className="button"
						onClick={onRegister}
						disabled={loading}
						title={!apiUrl ? "Configura NEXT_PUBLIC_GOOGLE_SCRIPT_URL" : ""}
					>
						{loading ? "Registrando..." : "Registrar"}
					</button>
				</div>

				<div className="meta">
					<span className="badge">
						<span>Productos en lista:</span>
						<b>{PRODUCTOS.length}</b>
					</span>
					<span className="badge">
						<span>API configurada:</span>
						<b>{apiUrl ? "Sí" : "No"}</b>
					</span>
				</div>

				{status ? <div className="status">{status}</div> : null}

				{lastSent ? (
					<div className="small">
						Último payload enviado:{" "}
						<span className="code">{JSON.stringify(lastSent)}</span>
					</div>
				) : (
					<div className="small">
						Nota: puedes permitir cualquier texto o validar que el producto
						exista en tu lista. (Ahorita se envía tal cual lo escribas.)
					</div>
				)}
			</div>

			<div className="small" style={{ marginTop: 14 }}>
				Consejo: si tu Apps Script no permite CORS, revisa el snippet en el
				README.
			</div>
		</main>
	);
}
