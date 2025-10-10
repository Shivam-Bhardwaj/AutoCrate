#!/usr/bin/env node
const { spawnSync } = require('child_process')

const isWindows = process.platform === 'win32'
const command = isWindows ? 'npx.cmd' : 'npx'
const result = spawnSync(command, ['tsc', '--noEmit'], {
  stdio: 'inherit',
  shell: isWindows
})

process.exit(result.status === null ? 1 : result.status)
