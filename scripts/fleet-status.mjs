#!/usr/bin/env node

// Script to merge signals from ACTIVITY_LOG, git log, and PRs to assess fleet status.

import fs from 'fs';
import { execSync } from 'child_process';

const ACTIVITY_LOG_PATH = 'docs/ACTIVITY_LOG.md';
const BOARD_PATH = 'docs/AGENT_BOARD.md';

// Function to get last activity from ACTIVITY_LOG for each handle
function getLastActivityFromLog() {
  const logContent = fs.readFileSync(ACTIVITY_LOG_PATH, 'utf8');
  const lines = logContent.split('\n');
  const activityMap = {};

  // Regex to match "By: <handle>" pattern
  const byPattern = /\(By: (.+)\)/;

  for (const line of lines) {
    const match = line.match(byPattern);
    if (match) {
      const handle = match[1].trim();
      // Extract timestamp if present, otherwise use a default old time
      // Simple heuristic: if starts with *, it might be the format we expect
      if (line.startsWith('*')) {
        // Try to extract date from "* YYYY-MM-DD: ..." or similar
        const dateMatch = line.match(/\* (\d{4}-\d{2}-\d{2})/);
        const dateStr = dateMatch ? dateMatch[1] : 'Unknown';
        activityMap[handle] = { source: 'ACTIVITY_LOG', timestamp: dateStr, line };
      } else {
        // If no date found in * format, just note the handle was seen
        activityMap[handle] = { source: 'ACTIVITY_LOG', timestamp: 'Unknown', line };
      }
    }
  }
  return activityMap;
}

// Function to get last commit activity from git log in the last 24 hours
function getLastGitActivity() {
  const activityMap = {};
  try {
    // Get commit history for the last 24 hours, format: %an (author name), %ai (author date iso)
    const gitLogOutput = execSync('git log --since="24 hours ago" --pretty=format:"%an|%ai"', { encoding: 'utf-8' });
    const commits = gitLogOutput.trim().split('\n');

    for (const commit of commits) {
      if (commit) {
        const [author, dateIso] = commit.split('|');
        if (author && dateIso) {
          const handle = author.trim(); // Assuming author name is the handle
          if (!activityMap[handle] || new Date(dateIso) > new Date(activityMap[handle].timestamp)) {
            activityMap[handle] = { source: 'GIT', timestamp: dateIso };
          }
        }
      }
    }
  } catch (e) {
    console.error('Could not fetch git log:', e.message);
  }
  return activityMap;
}

// Function to get open PR authors
function getOpenPRAuthors() {
  const authors = new Set();
  try {
    // Get list of open PRs with author information
    // This requires 'gh' CLI to be installed and authenticated
    const prListOutput = execSync('gh pr list --state open --json author', { encoding: 'utf-8' });
    const prList = JSON.parse(prListOutput);
    for (const pr of prList) {
      authors.add(pr.author.login);
    }
  } catch (e) {
    console.error('Could not fetch open PRs (requires "gh" CLI):', e.message);
    // Silently ignore if gh CLI is not available
  }
  return Array.from(authors);
}

// Main execution
console.log('--- Fleet Status Report ---');

const logActivity = getLastActivityFromLog();
const gitActivity = getLastGitActivity();
// const openPRAuthorList = getOpenPRAuthors(); // Not easily mappable to detailed activity like log/git

// Combine signals, prioritizing more recent ones
const combinedActivity = { ...logActivity }; // Start with log activity
for (const [handle, details] of Object.entries(gitActivity)) {
  if (!combinedActivity[handle] || new Date(details.timestamp) > new Date(combinedActivity[handle].timestamp)) {
    combinedActivity[handle] = { ...details, source: `${combinedActivity[handle]?.source || ''}+GIT`.trim() };
  }
}

// Print last activity per handle
for (const [handle, details] of Object.entries(combinedActivity)) {
  console.log(`${handle}: Last seen via ${details.source} at ${details.timestamp}`);
}

// Check AGENT_BOARD for IDLE agents (>30 min silence)
try {
  const boardContent = fs.readFileSync(BOARD_PATH, 'utf8');
  const lines = boardContent.split('\n');
  const now = new Date();

  for (const line of lines) {
    if (line.startsWith('| ') && !line.includes('Handle | Tier')) { // Skip header
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 6) {
        const handle = parts[1];
        const status = parts[4];
        const lastHeartbeatStr = parts[5];

        if (handle && lastHeartbeatStr && lastHeartbeatStr !== 'Last Heartbeat') {
          let lastHeartbeat = new Date(lastHeartbeatStr);
          if (isNaN(lastHeartbeat.getTime())) {
             // Try parsing if it's in a different format, e.g., "YYYY-MM-DD HH:mm UTC"
             lastHeartbeat = new Date(lastHeartbeatStr.replace(' UTC', 'Z'));
          }

          if (!isNaN(lastHeartbeat.getTime())) {
            const diffMinutes = (now - lastHeartbeat) / (1000 * 60);

            if (diffMinutes > 30) {
              console.log(`ALERT: ${handle} on AGENT_BOARD is IDLE (last heartbeat ${Math.round(diffMinutes)} mins ago, status: ${status}).`);
            }
          } else {
            console.log(`WARNING: Could not parse heartbeat time for ${handle}: "${lastHeartbeatStr}"`);
          }
        }
      }
    }
  }
} catch (e) {
  console.error('Could not read or parse AGENT_BOARD.md:', e.message);
}

console.log('--------------------------');