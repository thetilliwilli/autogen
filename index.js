const fs = require("fs");
const path = require("path");

class Metagen {
    // metagenFile = require.main.filename;
    metagenFile = globalThis.metagenFile;
    metagenFileDir = path.dirname(this.metagenFile);
    originalMetagen = null;
    files = [];
    result = "";
    target = null;

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
        this.target = path.isAbsolute(target) ? target : path.resolve(this.metagenFileDir, target);
        return this;
    }

    toSelf() {
        this.target = this.metagenFile;
        return this;
    }

    get __metagend__() {
        const finalTarget = this.target !== null ? this.target : this.metagenFile;
        const isSelf = finalTarget === this.metagenFile;

        const finalResult = isSelf
            ? `${this.originalMetagen}\n${this.result}`
            : this.result;

        fs.mkdirSync(path.dirname(finalTarget), { recursive: true });
        fs.writeFileSync(finalTarget, finalResult, "utf8");

        process.exit(0);
    }

    #saveOriginalMetagen() {
        // const metagenFileLines = fs.readFileSync(this.metagenFile, "utf8").split("\n");
        // const firstLineIndex = metagenFileLines.findIndex(line => line.includes(`require("metagen")`) || line.includes(`require('metagen')`) || line.includes("require(`metagen`)"));
        // const lastLineIndex = metagenFileLines.findIndex(line => line.includes(`__metagend__`));

        // if (firstLineIndex === -1 || lastLineIndex === -1) {
        //     console.error('no metagen code found. exit 1');
        //     process.exit(1);
        // }

        // this.originalMetagen = metagenFileLines.slice(0, lastLineIndex + 1).join("\n");
        this.originalMetagen = globalThis.originalMetagenCode;
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