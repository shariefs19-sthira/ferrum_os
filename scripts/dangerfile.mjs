import { danger, warn, fail, message } from "danger";

// Check if PR touches sensitive files without human approval
const touchedSensitiveFiles = [
  "AGENTS.md",
  ".github/",
  ".gitignore",
  "apps/api/",
  "package.json",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock"
];

const hasSensitiveFiles = danger.git.modified_files.some(file =>
  touchedSensitiveFiles.some(sensitive => 
    file === sensitive || file.startsWith(sensitive)
  )
);

if (hasSensitiveFiles && !danger.pr.body.includes("HUMAN-APPROVED")) {
  fail("⚠️ This PR touches sensitive files (AGENTS.md, .github/**, .gitignore, apps/api/**, package.json, *lock*) but does not contain 'HUMAN-APPROVED' in the PR description. This requires human approval.");
}

// Check if commits/PR title missing [task:] tag
const hasTaskTagInPrTitle = danger.pr.title.includes("[task:");
if (!hasTaskTagInPrTitle) {
  warn("📝 The PR title does not contain a [task:] tag. Consider adding one for better tracking.");
}

// Check commit messages for [task:] tag
const commitsWithoutTaskTag = danger.commits.filter(commit => 
  !commit.message.includes("[task:")
);

if (commitsWithoutTaskTag.length > 0) {
  warn(`📝 Some commits do not contain [task:] tags: ${commitsWithoutTaskTag.map(c => `"${c.message}"`).join(", ")}`);
}

// Success message
message("✅ PR checks completed successfully");