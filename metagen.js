const fs = require("fs");
const path = require("path");

class Metagen {
    metagenFile = require.main.filename;
    metagenFileDir = path.dirname(this.metagenFile);
    originalMetagen = null;
    files = [];
    result = "";

    from({ source, recursive, filter }) {

        this.#saveOriginalMetagen();

        const sourceAbsolutePath = path.isAbsolute(source) ? source : path.resolve(this.metagenFileDir, source);

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
        const out = path.isAbsolute(target) ? target : path.resolve(this.metagenFileDir, target);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, this.result, "utf8");
        return this;
    }

    toSelf() {
        this.result = `${this.originalMetagen}\n${this.result}`;
        this.to(this.metagenFile);
    }

    get __metagend__() {
        process.exit(0);
    }

    #saveOriginalMetagen() {
        const metagenFileLines = fs.readFileSync(this.metagenFile, "utf8").split("\n");
        const firstLineIndex = metagenFileLines.findIndex(line => line.includes(`require("metagen")`) || line.includes(`require('metagen')`) || line.includes("require(`metagen`)"));
        const lastLineIndex = metagenFileLines.findIndex(line => line.includes(`__metagend__`));

        if (firstLineIndex === -1 || lastLineIndex === -1) {
            console.error('no metagen code found. exit 1');
            process.exit(1);
        }

        this.originalMetagen = metagenFileLines.slice(firstLineIndex, lastLineIndex + 1).join("\n");
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