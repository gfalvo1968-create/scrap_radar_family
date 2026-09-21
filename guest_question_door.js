"use strict";

const ISSUE_TEMPLATE = "casey-guest-question.yml";
const link = document.getElementById("guestIssueLink");
const status = document.getElementById("guestDoorStatus");

function repositoryFromLocation(location) {
  const host = location.hostname.toLowerCase();
  const parts = location.pathname.split("/").filter(Boolean);
  if (host.endsWith(".github.io")) {
    const owner = host.slice(0, -".github.io".length);
    const repository = parts[0] || `${owner}.github.io`;
    return owner && repository ? `${owner}/${repository}` : "";
  }
  if (host === "github.com" && parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  return "";
}

const repository = repositoryFromLocation(window.location);
if (repository) {
  link.href = `https://github.com/${repository}/issues/new?template=${encodeURIComponent(ISSUE_TEMPLATE)}`;
  status.textContent = "The form opens on GitHub and creates a review request; it grants no repository permissions.";
} else {
  link.removeAttribute("href");
  link.setAttribute("aria-disabled", "true");
  status.textContent = "Open this page from the project’s GitHub Pages site, or open the repository’s Issues tab and choose “Casey Clark Guest Question.”";
  status.classList.add("error");
}
