#!/usr/bin/env node
const path = require('path');
const metagen = require('..');

const [, , target, ...rest] = process.argv;
if (!target) {
    console.error('usage: metagen <file-or-dir> [--recursive]');
    process.exit(1);
}

const recursive = rest.includes('-r') || rest.includes('--recursive');
const abs = path.resolve(process.cwd(), target);

metagen({ from: abs, recursive }).extract((files) => {
    for (const f of files) console.log(f.relPath);
    return '';
});
