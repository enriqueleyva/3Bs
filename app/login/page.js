"use client";

import { useEffect, useState } from "react";

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

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [status, setStatus] = useState("");
	const [loading, setLoading] = useState(false);

	const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

	useEffect(() => {
		if (typeof window === "undefined") return;
		const token =
			localStorage.getItem("auth_token") ||
			(document.cookie || "")
				.split("; ")
				.find((row) => row.startsWith("auth_token="))
				?.split("=")[1];

		if (token) {
			setStatus(
				"Ya existe un token guardado. Puedes continuar a la app principal."
			);
		}
	}, []);

	const handleLogin = async (event) => {
		event?.preventDefault?.();

		if (!email.trim() || !password.trim()) {
			setStatus("Completa correo y contraseña antes de continuar.");
			return;
		}

		if (!authUrl) {
			setStatus(
				"Falta configurar NEXT_PUBLIC_AUTH_URL. Revisa el archivo .env.local (ver README)."
			);
			return;
		}

		setLoading(true);
		setStatus("Enviando credenciales...");

		try {
			const res = await fetch(authUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await readResponseSmart(res);

			if (!res.ok) {
				throw new Error(
					typeof data === "string" ? data : JSON.stringify(data, null, 2)
				);
			}

			const token = data?.token || data?.access_token;

			if (token && typeof window !== "undefined") {
				localStorage.setItem("auth_token", token);
				document.cookie = `auth_token=${token}; path=/`;
			}

			setStatus(
				"✅ Sesión iniciada correctamente.\n\n" +
					"Respuesta del API:\n" +
					(typeof data === "string" ? data : JSON.stringify(data, null, 2)) +
					(token
						? '\n\nEl token se guardó en localStorage y cookie "auth_token".'
						: "")
			);
		} catch (err) {
			setStatus("❌ Error autenticando:\n" + (err?.message || String(err)));
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="container">
			<div className="card">
				<h1 className="h1">Iniciar sesión</h1>
				<p className="p">
					Usa tus credenciales para obtener un token desde tu servicio de
					autenticación configurado en <code>NEXT_PUBLIC_AUTH_URL</code>.
				</p>

				<form onSubmit={handleLogin}>
					<div className="field">
						<input
							className="input"
							type="email"
							value={email}
							placeholder="correo@ejemplo.com"
							onChange={(e) => setEmail(e.target.value)}
							autoComplete="email"
							required
						/>
					</div>

					<div className="field">
						<input
							className="input"
							type="password"
							value={password}
							placeholder="••••••••"
							onChange={(e) => setPassword(e.target.value)}
							autoComplete="current-password"
							required
						/>
					</div>

					<button className="button" type="submit" disabled={loading}>
						{loading ? "Ingresando..." : "Iniciar sesión"}
					</button>
				</form>

				{status ? <div className="status">{status}</div> : null}
			</div>
		</main>
	);
}
