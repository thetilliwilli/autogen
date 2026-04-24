#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function collectFiles(absFrom, recursive) {
    if (fs.statSync(absFrom).isFile()) return [absFrom];
    const out = [];
    const walk = (d) => {
        for (const name of fs.readdirSync(d)) {
            const p = path.join(d, name);
            if (fs.statSync(p).isDirectory()) { if (recursive) walk(p); }
            else out.push(p);
        }
    };
    walk(absFrom);
    return out;
}

function toFile(absPath, fromBase) {
    return {
        filename: path.basename(absPath),
        ext: path.extname(absPath),
        content: fs.readFileSync(absPath, 'utf8'),
        path: absPath,
        dir: path.dirname(absPath),
        relPath: path.relative(fromBase, absPath) || path.basename(absPath),
    };
}

function metagen({ from, recursive = false, filter } = {}) {
    const callerDir = path.dirname(require.main.filename);
    const absFrom = path.isAbsolute(from) ? from : path.resolve(callerDir, from);
    const base = fs.statSync(absFrom).isDirectory() ? absFrom : path.dirname(absFrom);
    let files = collectFiles(absFrom, recursive).map((p) => toFile(p, base));
    if (filter) files = files.filter(filter);
    return {
        extract(cb) {
            const content = cb(files);
            return {
                save(to) {
                    const out = path.isAbsolute(to) ? to : path.resolve(callerDir, to);
                    fs.mkdirSync(path.dirname(out), { recursive: true });
                    fs.writeFileSync(out, content, 'utf8');
                    return out;
                },
            };
        },
    };
}

// __autogen__();


module.exports = metagen;

if (require.main === module) {
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
}
