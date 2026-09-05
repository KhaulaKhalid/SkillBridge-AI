// Add GITHUB_TOKEN to .env — a free personal access token (no special
// scopes needed for public repo data) raises the limit from 60/hour to
// 5,000/hour. Generate one at: GitHub → Settings → Developer settings →
// Personal access tokens → Fine-grained tokens (read-only, public repos).

const README_FETCH_LIMIT = 3; // top N most recently updated repos get deep evidence (kept small for demo speed)

const DEPENDENCY_FILES = ["package.json", "requirements.txt", "composer.json", "pom.xml"];
const ENTRY_FILES = ["src/App.jsx", "src/App.js", "src/index.js", "index.js", "app.py", "main.py", "server.js"];

function authHeaders() {
  return {
    Accept: "application/vnd.github+json",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };
}

async function fetchFileContent(username, repoName, filePath) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`,
      { headers: authHeaders() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;
    const decoded = Buffer.from(data.content, data.encoding || "base64").toString("utf-8");
    return decoded.trim().slice(0, 1200);
  } catch {
    return null;
  }
}

async function fetchReadme(username, repoName) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/readme`,
      { headers: authHeaders() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;
    return Buffer.from(data.content, data.encoding || "base64").toString("utf-8").trim().slice(0, 1500);
  } catch {
    return null;
  }
}

/**
 * Lists the repo's actual file paths in ONE call (recursive git tree),
 * then only fetches content for files we know actually exist — no more
 * guessing 10+ filenames and eating a 404 for each miss.
 */
async function fetchRepoTree(username, repoName, defaultBranch) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
      { headers: authHeaders() }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.tree || []).filter((item) => item.type === "blob").map((item) => item.path);
  } catch {
    return [];
  }
}

function findFirstMatch(treePaths, candidates) {
  for (const candidate of candidates) {
    const match = treePaths.find((p) => p === candidate || p.endsWith(`/${candidate}`));
    if (match) return match;
  }
  return null;
}

/**
 * Pulls real evidence for one repo: README + a dependency manifest + an
 * entry file — but only fetches what the tree confirms exists (2-3 calls
 * total instead of 10+ guesses). Returns exact file paths so the frontend
 * can show precisely what was checked, not just a vague summary.
 */
async function fetchRepoEvidence(username, repoName, defaultBranch) {
  const [readme, treePaths] = await Promise.all([
    fetchReadme(username, repoName),
    fetchRepoTree(username, repoName, defaultBranch || "main"),
  ]);

  const dependencyPath = findFirstMatch(treePaths, DEPENDENCY_FILES);
  const entryPath = findFirstMatch(treePaths, ENTRY_FILES);

  const [dependencyContent, entryContent] = await Promise.all([
    dependencyPath ? fetchFileContent(username, repoName, dependencyPath) : null,
    entryPath ? fetchFileContent(username, repoName, entryPath) : null,
  ]);

  return {
    readme,
    dependencyFile: dependencyContent ? { path: dependencyPath, content: dependencyContent } : null,
    entryFile: entryContent ? { path: entryPath, content: entryContent } : null,
  };
}

async function fetchGithubRepos(username) {
  if (!username) return { repos: [], error: null };

  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=20`,
    { headers: authHeaders() }
  );

  if (res.status === 404) return { repos: [], error: "GitHub username not found" };
  if (!res.ok) return { repos: [], error: `GitHub API error (${res.status})` };

  const data = await res.json();

  const nonForkRepos = data
    .filter((repo) => !repo.fork)
    .map((repo) => ({
      name: repo.name,
      description: repo.description || "",
      language: repo.language || "Unknown",
      topics: repo.topics || [],
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
      defaultBranch: repo.default_branch || "main",
    }));

  const reposToEnrich = nonForkRepos.slice(0, README_FETCH_LIMIT);

  const evidence = await Promise.all(
    reposToEnrich.map((repo) => fetchRepoEvidence(username, repo.name, repo.defaultBranch))
  );

  const repos = nonForkRepos.map((repo, i) => ({
    ...repo,
    readme: i < README_FETCH_LIMIT ? evidence[i].readme : null,
    dependencyFile: i < README_FETCH_LIMIT ? evidence[i].dependencyFile : null,
    entryFile: i < README_FETCH_LIMIT ? evidence[i].entryFile : null,
  }));

  return { repos, error: null };
}

module.exports = { fetchGithubRepos };