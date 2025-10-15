import { Octokit } from "@octokit/core";
import https from "https";

// Configuración de entradas del Action
const token = process.env.INPUT_TOKEN;
const repository = process.env.INPUT_REPOSITORY;
const eventType = process.env.INPUT_EVENT_TYPE;
const clientPayload = process.env.INPUT_CLIENT_PAYLOAD
  ? JSON.parse(process.env.INPUT_CLIENT_PAYLOAD)
  : {};

// División de owner/repo
const [owner, repo] = repository.split("/");

// Detección automática de entorno: GitHub.com o GHES
const githubServerUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
const baseUrl = githubServerUrl.includes("github.com")
  ? "https://api.github.com"
  : `${githubServerUrl.replace(/\/$/, "")}/api/v3`;

// Permitir certificados self-signed en GHES (como tu caso)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Crear instancia de Octokit con agente HTTPS seguro
const octokit = new Octokit({
  auth: token,
  baseUrl,
  request: {
    agent: new https.Agent({
      rejectUnauthorized: false, // ignora validación de certificados
    }),
  },
});

console.log(`🚀 Dispatching '${eventType}' to ${repository}...`);

try {
  const response = await octokit.request("POST /repos/{owner}/{repo}/dispatches", {
    owner,
    repo,
    event_type: eventType,
    client_payload: clientPayload,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
      "Accept": "application/vnd.github.everest-preview+json",
    },
  });

  console.log(`✅ Repository dispatch sent! (status ${response.status})`);
} catch (error) {
  console.error("❌ Failed to send dispatch:");
  console.error(error.response?.data || error.message);
  process.exit(1);
}
