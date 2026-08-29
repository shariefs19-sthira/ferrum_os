#!/usr/bin/env node

// Batch Conductor Script
// This script runs periodically to check if a batch is complete and release the next one.
// It reads the WAVE_QUEUE.md file, verifies the status of tasks in the current batch,
// and if all are done, it opens the next batch, updates the AGENT_BOARD, and commits the changes.
// It also sets a stall flag on the AGENT_BOARD if it cannot proceed.

import { execSync } from 'child_process';
import fs from 'fs/promises';

const GITHUB_ACTOR = process.env.GITHUB_ACTOR || 'CONDUCTOR';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function runConductor() {
  console.log('Starting Batch Conductor...');

  // Fetch latest main
  execSync('git fetch origin main');
  execSync('git checkout main');
  execSync('git reset --hard origin/main');

  // Read WAVE_QUEUE.md
  const queueContent = await fs.readFile('docs/WAVE_QUEUE.md', 'utf8');

  // Parse the current batch status
  // Find the first batch that is OPEN
  const batchLines = queueContent.split('\n').filter(line => line.trim().startsWith('|') && line.includes('B'));
  let currentBatch = null;
  let nextBatch = null;
  let foundCurrent = false;

  for (const line of batchLines) {
    const match = line.match(/\| *([Bb]\d+) *\|/);
    if (match) {
      const batchId = match[1];
      if (line.includes('| OPEN   |')) {
        if (!foundCurrent) {
          currentBatch = batchId;
          foundCurrent = true;
        }
      } else if (foundCurrent && !nextBatch) {
         // Assume the next one after the current OPEN batch is the next one to release
         nextBatch = batchId;
         break;
      }
    }
  }

  if (!currentBatch) {
    console.log('No OPEN batch found. Checking for HUMAN-HOLD...');
    // Check for HUMAN-HOLD in the file content or a specific flag could be added.
    // For now, we'll assume if no OPEN batch and no explicit hold logic elsewhere, it's waiting.
    // This script doesn't manage opening the very first batch; it assumes B1 is manually opened or already open.
    // If B1 is closed, it implies a hold or completion of B1. We need to find a closed batch that should be checked.
    // Let's refine the logic: Find the *last completed* batch (all tasks under it are DONE) and the *next* one.
    // Re-parse to find the sequence and status of batches and their tasks.
    const lines = queueContent.split('\n');
    let currentBatchId = null;
    let batchStatusMap = {};
    let taskStatusMap = {};

    for (const line of lines) {
        const batchMatch = line.match(/^\s*\|\s*([Bb]\d+)\s*\|.*?\|.*?\|.*?\|\s*(OPEN|CLOSED)\s*\|/);
        if (batchMatch) {
            currentBatchId = batchMatch[1];
            batchStatusMap[currentBatchId] = batchMatch[2];
            continue;
        }

        const taskMatch = line.match(/^\s*\|\s*(W\d+-\d+)\s*\|\s*([Bb]\d+)\s*\|.*?\|.*?\|\s*(DONE|OPEN|etc)\s*\|/);
        if (taskMatch) {
            const taskId = taskMatch[1];
            const taskBatchId = taskMatch[2];
            const taskStatus = taskMatch[3];
            taskStatusMap[taskId] = { batch: taskBatchId, status: taskStatus };
        }
    }

    // Determine current batch as the one that is closed but whose tasks are all DONE
    // And next batch as the subsequent one that is currently CLOSED.
    let batchesInOrder = Object.keys(batchStatusMap).sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1)));
    let lastCompletedBatch = null;
    for (let i = 0; i < batchesInOrder.length; i++) {
        const batchId = batchesInOrder[i];
        const batchStatus = batchStatusMap[batchId];
        const tasksForThisBatch = Object.values(taskStatusMap).filter(t => t.batch === batchId);

        const allTasksDone = tasksForThisBatch.every(t => t.status === 'DONE');
        if (allTasksDone) {
            lastCompletedBatch = batchId;
        } else if (lastCompletedBatch && batchStatus === 'CLOSED') {
            // Found the next batch to open after a completed one
            currentBatch = lastCompletedBatch;
            nextBatch = batchId;
            break;
        }
    }
  }


  if (!nextBatch) {
    console.log('No next batch to release or all batches processed.');
    // Check for HUMAN-HOLD
    if (queueContent.includes('HUMAN-HOLD')) {
        await updateAgentBoard('STALLED', 'HUMAN-HOLD flag is active.');
        console.log('HUMAN-HOLD detected. Stalled.');
        return;
    }
    console.log('Nothing to do.');
    return;
  }

  console.log(`Identified Current Batch: ${currentBatch}, Next Batch to check/release: ${nextBatch}`);

  // Verify all tasks in the *current* batch are DONE
  const currentBatchTasks = [];
  const lines = queueContent.split('\n');
  let inCurrentBatchSection = false;

  for (const line of lines) {
     const batchHeaderMatch = line.match(/^\s*\|\s*([Bb]\d+)\s*\|/);
     if (batchHeaderMatch) {
         const batchId = batchHeaderMatch[1];
         if (batchId === currentBatch) {
             inCurrentBatchSection = true;
         } else if (inCurrentBatchSection) {
             // We've moved past the current batch
             break;
         }
     }
     if (inCurrentBatchSection) {
         const taskMatch = line.match(/^\s*\|\s*(W\d+-\d+)\s*\|/);
         if (taskMatch) {
             currentBatchTasks.push(taskMatch[1]);
         }
     }
  }

  console.log(`Tasks in current batch (${currentBatch}):`, currentBatchTasks);

  let allCurrentTasksDone = true;
  for (const taskId of currentBatchTasks) {
    const taskStatusMatch = queueContent.match(new RegExp(`^\\s*\\|\\s*${taskId}\\s*\\|.*\\|.*\\|.*\\|\\s*(\\w+)\\s*\\|`, 'm'));
    if (taskStatusMatch) {
      const status = taskStatusMatch[1];
      if (status !== 'DONE') {
        console.log(`Task ${taskId} in current batch ${currentBatch} is not DONE (${status}).`);
        allCurrentTasksDone = false;
        break;
      }
    } else {
        // If a task line isn't found properly, it's implicitly not done.
        console.log(`Task ${taskId} status line not found in queue.`);
        allCurrentTasksDone = false;
        break;
    }
  }

  if (!allCurrentTasksDone) {
    console.log(`Current batch ${currentBatch} is not fully complete. Cannot release ${nextBatch}.`);
    await updateAgentBoard('STALLED', `Waiting for completion of batch ${currentBatch}`);
    return;
  }

  console.log(`Current batch ${currentBatch} is fully complete.`);

  // Optional: Further verification via git log and CI status (requires GITHUB_TOKEN)
  // This is a simplified check. A full implementation would require GitHub API calls.
  for (const taskId of currentBatchTasks) {
    try {
      // Check if a commit with the task tag exists on main
      const gitLogOutput = execSync(`git log --oneline --grep="${taskId}"`, { encoding: 'utf-8' });
      if (!gitLogOutput.trim()) {
        console.log(`Commit for task ${taskId} not found on main branch.`);
        allCurrentTasksDone = false;
        break;
      }
      // Note: Checking CI status via `gh` command would require setting up the gh cli and authenticating,
      // which is complex for a simple script. The primary check is the status in the markdown file.
    } catch (error) {
      console.error(`Error checking git log for ${taskId}:`, error.message);
      allCurrentTasksDone = false;
      break;
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
    new RegExp(`^(\\s*\\|\\s*${nextBatch}\\s*\\|[^\\n]*\\|\\s*)CLOSED(\\s*\\|)`, 'm'),
    '$1OPEN$2'
  );

  await fs.writeFile('docs/WAVE_QUEUE.md', newQueueContent);

  // Update AGENT_BOARD.md: Mark the batch as released or update relevant agent statuses if applicable.
  // For simplicity, we'll just clear any existing STALL.
  await updateAgentBoard('OK', `Batch ${nextBatch} released by Conductor.`);

  // Commit and push
  execSync('git add docs/WAVE_QUEUE.md docs/AGENT_BOARD.md');
  const commitMessage = `[AI: CONDUCTOR] Release batch ${nextBatch}`;
  execSync(`git commit -m "${commitMessage}"`);
  execSync(`git push origin main`);

  console.log(`Batch ${nextBatch} released successfully.`);
}

async function updateAgentBoard(status, reason) {
  // This function updates the AGENT_BOARD.md file with a general status.
  // A more sophisticated version might track this per agent or per batch.
  // For now, we'll add a line to the top or find a specific "Conductor Status" field.
  try {
    let boardContent = await fs.readFile('docs/AGENT_BOARD.md', 'utf8');
    const statusLine = `\n\n> **Conductor Status:** ${status} - ${reason}\n`;
    // Prepend the status line after the first header or at the beginning
    boardContent = statusLine + boardContent;
    await fs.writeFile('docs/AGENT_BOARD.md', boardContent);
  } catch (error) {
    console.error('Error updating AGENT_BOARD:', error.message);
  }
}


runConductor().catch(console.error);