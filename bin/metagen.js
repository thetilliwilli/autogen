#!/usr/bin/env node
const path = require('path');
const { getMetagenCode } = require("../util.js");
// const metagen = require('..');

const [, , target, ...rest] = process.argv;
if (!target) {
    console.error('usage: metagen <file-or-dir> [--recursive]');
    process.exit(1);
}

const abs = path.resolve(process.cwd(), target);
console.log(target);
console.log(abs);

const originalMetagenCode = getMetagenCode(abs);
// console.log(originalMetagenCode);

const codeToExecute = originalMetagenCode.replace(/^\/\//mig, "");
globalThis.originalMetagenCode = originalMetagenCode;
globalThis.metagenFile = abs;

eval(codeToExecute);


// const recursive = rest.includes('-r') || rest.includes('--recursive');

// metagen({ from: abs, recursive }).extract((files) => {
//     for (const f of files) console.log(f.relPath);
//     return '';
// });

console.log(12)