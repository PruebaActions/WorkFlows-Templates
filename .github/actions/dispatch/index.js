import { Octokit } from "@octokit/core";

const token = process.env.INPUT_TOKEN;
const repository = process.env.INPUT_REPOSITORY;
const eventType = process.env.INPUT_EVENT_TYPE;
const clientPayload = process.env.INPUT_CLIENT_PAYLOAD
  ? JSON.parse(process.env.INPUT_CLIENT_PAYLOAD)
  : {};

const [owner, repo] = repository.split("/");

const baseUrl = process.env.GITHUB_SERVER_URL
  ? `${process.env.GITHUB_SERVER_URL}/api/v3`
  : "https://api.github.com";

const octokit = new Octokit({ auth: token, baseUrl });

console.log(`🚀 Dispatching '${eventType}' to ${repository}...`);

try {
  const response = await octokit.request("POST /repos/{owner}/{repo}/dispatches", {
    owner,
    repo,
    event_type: eventType,
    client_payload: clientPayload
  });

  console.log(`✅ Repository dispatch sent! (status ${response.status})`);
} catch (error) {
  console.error("❌ Failed to send dispatch:");
  console.error(error.response?.data || error.message);
  process.exit(1);
}
