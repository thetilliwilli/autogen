const fs = require("fs");
const path = require("path");

class Metagen {
    requireMainFilename = require.main.filename;
    callerDir = path.dirname(this.requireMainFilename);
    files = [];
    result = "";

    from({ source, recursive, filter }) {
        const sourceAbsolutePath = path.isAbsolute(source) ? source : path.resolve(this.callerDir, source);

        const files = this.#collectFiles(sourceAbsolutePath, recursive)
            .map(filePath => this.#toFile(filePath));

        if (filter) files = files.filter(filter);

        this.files = files;

        return this;
    }

    make(callback) {
        this.result = callback(this.files);
        return this;
    }

    to(target) {
        const out = path.isAbsolute(target) ? target : path.resolve(this.callerDir, target);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, this.result, "utf8");
        return this;
    }

    toSelf() {
        this.to(this.requireMainFilename);
    }

    get __metagend__() {
        process.exit(0);
    }

    #collectFiles(sourceAbsolutePath, recursive) {
        if (fs.statSync(sourceAbsolutePath).isFile()) return [sourceAbsolutePath];
        const filePaths = [];
        const walk = (d) => {
            for (const name of fs.readdirSync(d)) {
                const p = path.join(d, name);
                if (fs.statSync(p).isDirectory()) { if (recursive) walk(p); }
                else filePaths.push(p);
            }
        };
        walk(sourceAbsolutePath);
        return filePaths;
    }

    #toFile(filePath) {
        return {
            filename: path.basename(filePath),
            ext: path.extname(filePath),
            content: fs.readFileSync(filePath, "utf8"),
            path: filePath,
            dir: path.dirname(filePath),
        };
    }
}

const metagen = new Metagen();

module.exports = metagen;