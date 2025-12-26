"use client";
import $ from "jquery";

import { useRouter } from "next/navigation";
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

	const router = useRouter();

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
				"Falta configurar NEXT_PUBLIC_AUTH_URL. Revisa el archivo .env.local."
			);
			return;
		}

		setLoading(true);
		setStatus("Enviando credenciales...");
		const username = email;
		const settings = {
			url: authUrl,
			type: "POST",
			data: JSON.stringify({ username, password }),
			success: function () {
				// resolve()
			},
			error: function () {
				// reject();
			},
		};

		$.ajax(settings)
			.done(function (response) {
				console.log(response);
				const token = response?.token || response?.access_token;
				if (token && typeof window !== "undefined") {
					localStorage.setItem("auth_token", token);
					document.cookie = `auth_token=${token}; path=/`;
				}
				setStatus(
					"✅ Sesión iniciada correctamente.\n\n" +
						"Respuesta del API:\n" +
						(typeof response === "string"
							? response
							: JSON.stringify(response, null, 2)) +
						(token
							? '\n\nEl token se guardó en localStorage y cookie "auth_token".'
							: "")
				);
				if (response?.ok === true) {
					router.push("/");
				}
			})
			.fail(function (xhr, _status, error) {
				const msg = xhr?.responseText || error || "Error autenticando";
				setStatus("❌ Error autenticando:\n" + msg);
			})
			.always(function () {
				setLoading(false);
			});
		// $.ajax({
		// 	url: authUrl,
		// 	type: "POST",

		// 	contentType: "application/json; charset=utf-8",
		// 	dataType: "json", // o "text" si tu API no devuelve JSON
		// 	success: (data) => {
		// 		const token = data?.token || data?.access_token;
		// 		if (token && typeof window !== "undefined") {
		// 			localStorage.setItem("auth_token", token);
		// 			document.cookie = `auth_token=${token}; path=/`;
		// 		}
		// 		setStatus(
		// 			"✅ Sesión iniciada correctamente.\n\n" +
		// 				"Respuesta del API:\n" +
		// 				(typeof data === "string" ? data : JSON.stringify(data, null, 2)) +
		// 				(token
		// 					? '\n\nEl token se guardó en localStorage y cookie "auth_token".'
		// 					: "")
		// 		);
		// 	},
		// 	error: (xhr, _status, error) => {
		// 		const msg = xhr?.responseText || error || "Error autenticando";
		// 		setStatus("❌ Error autenticando:\n" + msg);
		// 	},
		// 	complete: () => setLoading(false),
		// });
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
