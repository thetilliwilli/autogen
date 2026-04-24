const fs = require("fs");

module.exports = {
    getMetagenCode(metagenFile) {
        const metagenFileLines = fs.readFileSync(metagenFile, "utf8").split("\n");
        const firstLineIndex = metagenFileLines.findIndex(line => line.includes(`require("metagen")`) || line.includes(`require('metagen')`) || line.includes("require(`metagen`)"));
        const lastLineIndex = metagenFileLines.findIndex(line => line.includes(`__metagend__`));

        if (firstLineIndex === -1 || lastLineIndex === -1) {
            console.error('no metagen code found. exit 1');
            process.exit(1);
        }

        const metagenCode = metagenFileLines.slice(0, lastLineIndex + 1).join("\n");

        return metagenCode;
    }
}