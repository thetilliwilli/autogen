const fs = require('fs');
const path = require('path');

// function collectFiles(absFrom, recursive) {
//     if (fs.statSync(absFrom).isFile()) return [absFrom];
//     const out = [];
//     const walk = (d) => {
//         for (const name of fs.readdirSync(d)) {
//             const p = path.join(d, name);
//             if (fs.statSync(p).isDirectory()) { if (recursive) walk(p); }
//             else out.push(p);
//         }
//     };
//     walk(absFrom);
//     return out;
// }

// function toFile(absPath, fromBase) {
//     return {
//         filename: path.basename(absPath),
//         ext: path.extname(absPath),
//         content: fs.readFileSync(absPath, 'utf8'),
//         path: absPath,
//         dir: path.dirname(absPath),
//         relPath: path.relative(fromBase, absPath) || path.basename(absPath),
//     };
// }

// function metagen({ from, recursive = false, filter } = {}) {
//     const callerDir = path.dirname(require.main.filename);
//     const absFrom = path.isAbsolute(from) ? from : path.resolve(callerDir, from);
//     const base = fs.statSync(absFrom).isDirectory() ? absFrom : path.dirname(absFrom);
//     let files = collectFiles(absFrom, recursive).map((p) => toFile(p, base));
//     if (filter) files = files.filter(filter);
//     return {
//         extract(cb) {
//             const content = cb(files);
//             return {
//                 save(to) {
//                     const out = path.isAbsolute(to) ? to : path.resolve(callerDir, to);
//                     fs.mkdirSync(path.dirname(out), { recursive: true });
//                     fs.writeFileSync(out, content, 'utf8');
//                     return out;
//                 },
//             };
//         },
//     };
// }


class Metagen {

    entryFileName = require.main.filename;
    callerDir = null;
    absoluteSourcesPath = null;
    files = [];
    result = "";


    from(sourcesPath) {
        this.callerDir = path.dirname(this.entryFileName);

        this.absoluteSourcesPath = path.isAbsolute(sourcesPath) ? sourcesPath : path.resolve(this.callerDir, sourcesPath);

        const base = fs.statSync(this.absoluteSourcesPath).isDirectory() ? this.absoluteSourcesPath : path.dirname(this.absoluteSourcesPath);

        this.files = this.#collectFiles(absoluteSourcesPath, recursive)
            .map((p) => this.#toFile(p, base))
            .filter(filter)
            ;

        return this;
    }

    to(callback) {
        this.result = callback(files);
        return this;
    }

    save(to) {
        const out = path.isAbsolute(to) ? to : path.resolve(this.callerDir, to);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, this.result, 'utf8');
        // return out;
    }

    #toFile(absPath, fromBase) {
        return {
            filename: path.basename(absPath),
            ext: path.extname(absPath),
            content: fs.readFileSync(absPath, 'utf8'),
            path: absPath,
            dir: path.dirname(absPath),
            relPath: path.relative(fromBase, absPath) || path.basename(absPath),
        };
    }

    #collectFiles(absFrom, recursive) {
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
}

const metagen = new Metagen();

module.exports = metagen;