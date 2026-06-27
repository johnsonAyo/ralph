#!/usr/bin/env node
` (CSS has no // comments and
 *   `;
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
const TS_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const args = process.argv.slice(2);
let processed = 0;
let touched = 0;
let failed = 0;
for (const file of args) {
    try {
        const ext = path.extname(file).toLowerCase();
        const source = fs.readFileSync(file, "utf8");
        let output;
        if (TS_EXTS.has(ext)) {
            const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
            const printer = ts.createPrinter({
                removeComments: true,
                newLine: ts.NewLineKind.LineFeed,
            });
            output = printer.printFile(sourceFile);
        }
        else if (ext === ".css") {
            output = source.replace(/\/\*[\s\S]*?\*\//g, "");
        }
        else {
            continue;
        }
        if (output !== source) {
            fs.writeFileSync(file, output);
            touched += 1;
        }
        processed += 1;
    }
    catch (err) {
        failed += 1;
        process.stderr.write(`ERR ${file}: ${err instanceof Error ? err.message : err}\n`);
    }
}
process.stderr.write(`strip-source-comments: processed=${processed} touched=${touched} failed=${failed}\n`);
