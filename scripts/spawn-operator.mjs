#!/usr/bin/env node

import fs from 'fs/promises';
import { spawn } from 'child_process';

const args = process.argv.slice(2);
const dryRunArgIndex = args.indexOf('--dry-run');
const dryRun = dryRunArgIndex !== -1;
if (dryRun) {
  args.splice(dryRunArgIndex, 1);
}

const taskArgIndex = args.indexOf('--task');
let taskIdOverride = null;
if (taskArgIndex !== -1 && args[taskArgIndex + 1]) {
  taskIdOverride = args[taskArgIndex + 1];
  args.splice(taskArgIndex, 2);
}

async function parseWaveQueue(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');

  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|') && lines[i].includes('Assigned To')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error(`Could not find table header in ${filePath}`);
  }

  const headerLine = lines[headerIndex];
  const columns = headerLine.split('|').map(col => col.trim());

  const assignedToColIndex = columns.findIndex(col => col === 'Assigned To');
  const statusColIndex = columns.findIndex(col => col === 'Status');
  const taskIdColIndex = columns.findIndex(col => col === 'Task ID');
  const domainColIndex = columns.findIndex(col => col === 'J/Domain'); // Assuming this holds scope info

  if (assignedToColIndex === -1 || statusColIndex === -1 || taskIdColIndex === -1 || domainColIndex === -1) {
    throw new Error('Could not find required columns in table header.');
  }

  for (let i = headerIndex + 2; i < lines.length; i++) { // +2 to skip header and separator
    const line = lines[i];
    if (line.trim().startsWith('|')) {
      const cells = line.split('|').map(cell => cell.trim());
      if (cells.length > Math.max(assignedToColIndex, statusColIndex, taskIdColIndex, domainColIndex)) {
        const assignedTo = cells[assignedToColIndex];
        const status = cells[statusColIndex];
        const taskId = cells[taskIdColIndex];
        const taskDescription = cells[domainColIndex];

        if (status === 'OPEN' && assignedTo === 'Operator' && (!taskIdOverride || taskId === taskIdOverride)) {
          console.log(`Found next open operator task: ${taskId} with description: ${taskDescription}`);
          return { id: taskId, description: taskDescription };
        }
      }
    }
  }
  return null;
}

async function updateAgentBoard(boardPath, handle, taskId, status, pid, heartbeat, nextAction) {
  const boardContent = await fs.readFile(boardPath, 'utf8');
  const newRow = `| AG-012 | ${handle} | ${taskId} | ${status} | ${heartbeat} | PID: ${pid}, ${nextAction} |`;

  const lines = boardContent.split('\n');
  let tableEndIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|') && lines[i].includes('ID') && lines[i].includes('handle')) {
      // Found header, next non-separator line is the start of body
      const tableBodyStart = i + 2; // Skip header and separator
      // Find the end of the table (first non-row line)
      for (let j = tableBodyStart; j < lines.length; j++) {
        if (!lines[j].trim().startsWith('|') || !lines[j].includes('|') || !lines[j].includes('AG-')) {
          tableEndIndex = j;
          break;
        }
      }
      if (tableEndIndex === -1) { // If no end found, append to end of file/array
        tableEndIndex = lines.length;
      }
      break;
    }
  }

  if (tableEndIndex !== -1) {
    const newLines = [...lines.slice(0, tableEndIndex), newRow, ...lines.slice(tableEndIndex)];
    await fs.writeFile(boardPath, newLines.join('\n'));
    console.log(`Updated AGENT_BOARD.md for ${handle} working on ${taskId}.`);
  } else {
    console.log(`Could not find table in ${boardPath} to update.`);
  }
}


// --- Main Script Execution ---

console.log('Starting Operator Spawner...');

try {
  const taskInfo = await parseWaveQueue('./docs/WAVE_QUEUE.md');

  if (!taskInfo) {
    console.log('No matching OPEN operator tasks found in ./docs/WAVE_QUEUE.md. Exiting.');
    process.exit(0);
  }

  const nextTaskId = taskInfo.id;
  const taskDescription = taskInfo.description;

  console.log(`Next task to process: ${nextTaskId} with description: ${taskDescription}`);

  // --- SCOPE ENFORCEMENT LOGIC ---
  let scopeFiles = '';
  let scopeDomains = '';
  const scopeForbiddenOps = 'delete, payment, email, prod_push';

  // Example: parse description for keywords (this is a stub)
  if (taskDescription.match(/QA/)) {
    scopeFiles = 'apps/web/, docs/';
    scopeDomains = 'localhost:5173, github.com';
  }
  if (taskDescription.match(/baseline/)) {
    scopeFiles = 'apps/web/__tests__/visual/';
    scopeDomains = 'localhost:5173';
  }
  if (taskDescription.match(/Scout/)) {
    scopeFiles = 'docs/';
    scopeDomains = 'scout.ai, google.com';
  }


  const scopePrompt = `
You are an AI operator agent. Your task is ID: ${nextTaskId}.
The task description is: ${taskDescription}.

You may ONLY touch the following files/directories: ${scopeFiles}.
You may ONLY visit the following domains/network locations: ${scopeDomains}.
You may NOT perform the following operations: ${scopeForbiddenOps}.
If any step of your plan requires you to violate these scope boundaries (e.g., access a disallowed file or domain, perform a forbidden operation),
STOP IMMEDIATELY and log a HUMAN-HOLD request. Do not attempt to proceed or find a workaround on your own.
`;

  console.log('Generated scope-enforcing prompt for task', nextTaskId);

  // Compose command to run the operator with the scope prompt
  // Placeholder command, replace with actual interpreter/agent command
  const commandToRun = ['echo', `'${scopePrompt}'`, '&&', 'echo', `'Placeholder for Operator task ${nextTaskId} execution with scope enforcement.'`, '&&', 'sleep', '10'];

  // Print details for Dry Run
  if (dryRun) {
    console.log('DRY RUN MODE ENABLED.');
    console.log('Scope Prompt:');
    console.log(scopePrompt);
    console.log('Command to Run (in real run):');
    console.log(commandToRun.join(' '));
    console.log(`Would attempt to launch with scope: Files=${scopeFiles}, Domains=${scopeDomains}, Forbidden=${scopeForbiddenOps}`);
    console.log('DRY RUN COMPLETE — nothing launched, nothing written');
    process.exit(0);
  }

  // --- REAL RUN PATH ---
  console.log('Launching operator process...');
  const child = spawn(commandToRun[0], commandToRun.slice(1), { stdio: 'inherit' });

  const opPid = child.pid;
  const startTime = new Date().toISOString();
  const handle = 'Operator';
  const status = 'IN-PROGRESS';
  const nextAction = `Running task ${nextTaskId} with enforced scope`;

  console.log(`Launched operator process for task ${nextTaskId} with pseudo-PID ${opPid}.`);

  // Update the agent board
  await updateAgentBoard('./docs/AGENT_BOARD.md', handle, nextTaskId, status, opPid, startTime, nextAction);

  console.log(`Operator process for ${nextTaskId} initiated with scope enforcement.`);

  // Wait for the child process to finish
  await new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`Operator task ${nextTaskId} completed successfully.`);
        resolve();
      } else {
        console.error(`Operator task ${nextTaskId} failed with exit code ${code}.`);
        reject(new Error(`Child process exited with code ${code}`));
      }
    });
  });

} catch (error) {
  console.error('An error occurred:', error.message);
  process.exit(1);
}