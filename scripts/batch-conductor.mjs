#!/usr/bin/env node

// Batch Conductor Script v2
// This script runs periodically to check if a batch is complete and release the next one.
// It reads the WAVE_QUEUE.md file, verifies the status of tasks in the current batch *recursively*,
// and if all are done, it opens the next batch, updates the AGENT_BOARD, and commits the changes.
// It also sets a stall flag on the AGENT_BOARD if it cannot proceed.

import { execSync } from 'child_process';
import fs from 'fs/promises';

const GITHUB_ACTOR = process.env.GITHUB_ACTOR || 'CONDUCTOR';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function runConductor() {
  console.log('Starting Batch Conductor v2...');

  // Fetch latest main
  execSync('git fetch origin main');
  execSync('git checkout main');
  execSync('git reset --hard origin/main');

  // Read WAVE_QUEUE.md
  const queueContent = await fs.readFile('docs/WAVE_QUEUE.md', 'utf8');

  // Parse the current batch status and task relationships
  const lines = queueContent.split('\n');
  let currentBatch = null;
  let nextBatch = null;
  let foundCurrent = false;

  // Find the first batch that is OPEN
  for (const line of lines) {
    const batchMatch = line.match(/^\s*\|\s*([Bb]\d+)\s*\|/);
    if (batchMatch) {
      const batchId = batchMatch[1];
      if (line.includes('| OPEN   |')) {
        if (!foundCurrent) {
          currentBatch = batchId;
          foundCurrent = true;
        }
      } else if (foundCurrent && !nextBatch) {
         nextBatch = batchId;
         break;
      }
    }
  }

  if (!currentBatch) {
    console.log('No OPEN batch found. Checking for HUMAN-HOLD...');
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

  // Check for HUMAN-HOLD
  if (queueContent.includes('HUMAN-HOLD')) {
    console.log('HUMAN-HOLD flag detected.');
    await updateAgentBoard('STALLED', 'HUMAN-HOLD flag is active.');
    return;
  }

  // --- Release the next batch ---
  console.log(`Releasing batch ${nextBatch}...`);

  // Update WAVE_QUEUE.md: change next batch status from CLOSED to OPEN
  const newQueueContent = queueContent.replace(
    new RegExp(`^(\\s*\\|\\s*\\s*\\|\\s*\\s*\\|\\s*${nextBatch}\\s*\\|[^\\n]*\\|\\s*)CLOSED(\\s*\\|)`, 'm'),
    '$1OPEN$2'
  );

  await fs.writeFile('docs/WAVE_QUEUE.md', newQueueContent);

  // Update AGENT_BOARD.md
  await updateAgentBoard('OK', `Batch ${nextBatch} released by Conductor.`);

  // Commit and push
  execSync('git add docs/WAVE_QUEUE.md docs/AGENT_BOARD.md');
  const commitMessage = `[AI: CONDUCTOR] Release batch ${nextBatch}`;
  execSync(`git commit -m "${commitMessage}"`);
  execSync(`git push origin main`);

  console.log(`Batch ${nextBatch} released successfully.`);
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