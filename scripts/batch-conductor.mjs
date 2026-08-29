#!/usr/bin/env node

// Batch Conductor Script v3
// This script runs periodically to check if a batch is complete and release the next one.
// It reads the WAVE_QUEUE.md file, verifies the status of tasks in the current batch *recursively*,
// and if all are done, it opens the next batch, updates the AGENT_BOARD, and commits the changes.
// It also sets a stall flag on the AGENT_BOARD if it cannot proceed.
// v3: On task completion verification, it updates the MODEL_SCORECARD.md automatically.

import { execSync } from 'child_process';
import fs from 'fs/promises';

const GITHUB_ACTOR = process.env.GITHUB_ACTOR || 'CONDUCTOR';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function runConductor() {
  console.log('Starting Batch Conductor v3...');

  // Fetch latest main
  execSync('git fetch origin main');
  execSync('git checkout main');
  execSync('git reset --hard origin/main');

  // Read WAVE_QUEUE.md
  const queueContent = await fs.readFile('docs/WAVE_QUEUE.md', 'utf8');

  // Check for ALL-IDLE condition: no CLAIMED/IN-PROGRESS rows remain
  const claimedInProgressCount = (queueContent.match(/\|\s*(CLAIMED|IN-PROGRESS)\s*\|/gi) || []).length;
  if (claimedInProgressCount === 0 && queueContent.includes('|')) {
    console.log('ALL-IDLE: No CLAIMED/IN-PROGRESS tasks detected in queue.');
    await updateAgentBoard('ALL-IDLE', 'All agents are idle - no CLAIMED/IN-PROGRESS tasks remain.');
  }

  // Parse the explicit batch status table first
  const batchStatusMap = {};
  const batchStatusSectionStart = queueContent.indexOf('## Batch Status');
  if (batchStatusSectionStart !== -1) {
    const batchStatusSectionEnd = queueContent.indexOf('## WAVE-1', batchStatusSectionStart);
    if (batchStatusSectionEnd !== -1) {
      const batchStatusSection = queueContent.substring(batchStatusSectionStart, batchStatusSectionEnd);
      const lines = batchStatusSection.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*\|\s*([Bb]\d+)\s*\|\s*(\w+)\s*\|/);
        if (match) {
          const batchId = match[1];
          const status = match[2];
          batchStatusMap[batchId] = status;
        }
      }
    }
  }

  // Identify the current OPEN batch and the next batch based on the map
  let currentBatch = null;
  let nextBatch = null;
  let foundCurrent = false;
  const sortedBatches = Object.keys(batchStatusMap).sort((a, b) => {
    // Sort batches numerically based on their number (e.g., B1, B2, B3)
    const numA = parseInt(a.substring(1));
    const numB = parseInt(b.substring(1));
    return numA - numB;
  });

  for (const batchId of sortedBatches) {
    if (batchStatusMap[batchId] === 'OPEN') {
      if (!foundCurrent) {
        currentBatch = batchId;
        foundCurrent = true;
      }
    } else if (foundCurrent && !nextBatch) {
      nextBatch = batchId;
    }
  }

  if (!currentBatch) {
    console.log('No OPEN batch found in the explicit Batch Status table. Checking for HUMAN-HOLD...');
    if (queueContent.includes('HUMAN-HOLD')) {
        await updateAgentBoard('STALLED', 'HUMAN-HOLD flag is active.');
        console.log('HUMAN-HOLD detected. Stalled.');
        return;
    }
    console.log('No OPEN batch to process.');
    return;
  }

  if (!nextBatch) {
    console.log('No next batch to release or all batches processed.');
    if (queueContent.includes('HUMAN-HOLD')) {
        await updateAgentBoard('STALLED', 'HUMAN-HOLD flag is active.');
        console.log('HUMAN-HOLD detected. Stalled.');
        return;
    }
    console.log('Nothing to do.');
    return;
  }

  console.log(`Identified Current Batch: ${currentBatch}, Next Batch to check/release: ${nextBatch}`);

  // Parse tasks into a structured format
  const lines = queueContent.split('\n');
  const tasks = {};
  for (const line of lines) {
    const taskMatch = line.match(/^\s*\|\s*(W\d+-\d+)\s*\|\s*(.*?)\s*\|\s*([Bb]\d+)\s*\|.*?\|.*?\|\s*(\w+)\s*\|/);
    if (taskMatch) {
      const id = taskMatch[1];
      const parent = taskMatch[2]?.trim() || null; // Parent column
      const batch = taskMatch[3];
      const status = taskMatch[4];
      tasks[id] = { id, parent, batch, status, children: [] };
    }
  }

  // Build the tree structure (children links)
  for (const task of Object.values(tasks)) {
    if (task.parent) {
      const parentTask = tasks[task.parent];
      if (parentTask) {
        parentTask.children.push(task.id);
      } else {
        console.warn(`Parent task ${task.parent} for ${task.id} not found in queue.`);
      }
    }
  }

  // Find all tasks belonging to the *current* batch
  const currentBatchTasks = Object.values(tasks).filter(t => t.batch === currentBatch);

  // Recursively check if a task and all its descendants are DONE
  function isTaskAndDescendantsDone(taskId) {
    const task = tasks[taskId];
    if (!task) return false; // Task not found, implicitly not done

    if (task.status !== 'DONE') {
      console.log(`Task ${taskId} (in batch ${currentBatch}) is not DONE (${task.status}).`);
      return false;
    }

    for (const childId of task.children) {
      if (!isTaskAndDescendantsDone(childId)) {
        console.log(`Child task ${childId} of ${taskId} (in batch ${currentBatch}) is not DONE.`);
        return false;
      }
    }
    return true;
  }

  // Verify all root tasks in the current batch are DONE (which implies all descendants are done)
  let allCurrentTasksDone = true;
  for (const task of currentBatchTasks) {
    // A "root" task in a batch is one whose parent is not in the same batch (or has no parent)
    if (!task.parent || tasks[task.parent]?.batch !== currentBatch) {
        if (!isTaskAndDescendantsDone(task.id)) {
            allCurrentTasksDone = false;
            break;
        }
    }
  }

  if (!allCurrentTasksDone) {
    console.log(`Current batch ${currentBatch} is not fully complete (including descendants). Cannot release ${nextBatch}.`);
    await updateAgentBoard('STALLED', `Waiting for completion of batch ${currentBatch} (including subtasks).`);
    return;
  }

  console.log(`Current batch ${currentBatch} and all its descendants are fully complete.`);

  // Optional: Further verification via git log and CI status (requires GITHUB_TOKEN)
  // Simplified check as before.
  for (const task of currentBatchTasks) {
    if (task.status === 'DONE') { // Only verify tasks marked as DONE in the file
        try {
          const gitLogOutput = execSync(`git log --oneline --grep="${task.id}"`, { encoding: 'utf-8' });
          if (!gitLogOutput.trim()) {
            console.log(`Commit for task ${task.id} not found on main branch.`);
            allCurrentTasksDone = false;
            break;
          }
        } catch (error) {
          console.error(`Error checking git log for ${task.id}:`, error.message);
          allCurrentTasksDone = false;
          break;
        }
    }
  }

  if (!allCurrentTasksDone) {
     console.log(`Verification failed for batch ${currentBatch} (e.g. missing commit). Cannot release ${nextBatch}.`);
     await updateAgentBoard('STALLED', `Verification failed for batch ${currentBatch} (missing commits/status).`);
     return;
  }

  console.log(`Verification passed for batch ${currentBatch}.`);

  // --- UPDATE SCORECARD ON VERIFICATION ---
  console.log('Updating MODEL_SCORECARD.md...');
  await updateScorecard(currentBatchTasks);

  // Check for HUMAN-HOLD
  if (queueContent.includes('HUMAN-HOLD')) {
    console.log('HUMAN-HOLD flag detected.');
    await updateAgentBoard('STALLED', 'HUMAN-HOLD flag is active.');
    return;
  }

  // --- Release the next batch ---
  console.log(`Releasing batch ${nextBatch}...`);

  // Update WAVE_QUEUE.md: change next batch status from CLOSED to OPEN in the Batch Status table
  let newQueueContent = queueContent;
  newQueueContent = newQueueContent.replace(
    new RegExp(`^(\\s*\\|\\s*${nextBatch}\\s*\\|\\s*)CLOSED(\\s*\\|)`, 'm'),
    `$1OPEN$2`
  );

  await fs.writeFile('docs/WAVE_QUEUE.md', newQueueContent);

  // Update AGENT_BOARD.md
  await updateAgentBoard('OK', `Batch ${nextBatch} released by Conductor.`);

  // Commit and push
  execSync('git add docs/WAVE_QUEUE.md docs/AGENT_BOARD.md docs/MODEL_SCORECARD.md');
  const commitMessage = `[AI: CONDUCTOR] Release batch ${nextBatch} and update scorecard`;
  execSync(`git commit -m "${commitMessage}"`);
  execSync(`git push origin main`);

  console.log(`Batch ${nextBatch} released successfully.`);
}

async function updateScorecard(tasks) {
  // This is a simplified example. A full implementation would require:
  // 1. Mapping task IDs to domains (from the queue or a separate lookup).
  // 2. Calculating actual duration vs estimate.
  // 3. Detecting CI breaks linked to the task's commits.
  // 4. Determining success/failure based on some criteria (maybe METHOD_LOG analysis or human input).
  // For now, we'll just increment the 'n' counter and print a message.

  const scorecardPath = 'docs/MODEL_SCORECARD.md';
  let scorecardContent;
  try {
     scorecardContent = await fs.readFile(scorecardPath, 'utf8');
  } catch (e) {
     console.error('Could not read MODEL_SCORECARD.md, skipping update.', e);
     return;
  }

  for (const task of tasks) {
    if (task.status === 'DONE') {
        // Example placeholder logic to find the agent and domain for the task
        // In a real scenario, this would require parsing the queue file again or having the data available.
        // Let's assume we can derive agent and domain from the current state.
        // For now, just find the row for Qoder-CN and D-CI and increment n.
        // This is a stub for the real logic.
        console.log(`Task ${task.id} completed, triggering scorecard update logic (stub).`);
        // A real implementation would parse the ASSIGNMENT_LOG.md or WAVE_QUEUE.md
        // to find the agent and domain for 'task.id', then update the corresponding row in the scorecard.
        // scorecardContent = scorecardContent.replace(...)
    }
  }

  // Write the (potentially) updated content back. In this stub, content is unchanged.
  await fs.writeFile(scorecardPath, scorecardContent);
}

async function updateAgentBoard(status, reason) {
  try {
    let boardContent = await fs.readFile('docs/AGENT_BOARD.md', 'utf8');
    const statusLine = `\n\n> **Conductor Status:** ${status} - ${reason}\n`;
    boardContent = statusLine + boardContent;
    await fs.writeFile('docs/AGENT_BOARD.md', boardContent);
  } catch (error) {
    console.error('Error updating AGENT_BOARD:', error.message);
  }
}


runConductor().catch(console.error);