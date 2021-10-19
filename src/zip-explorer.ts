import { DosConfig } from "emulators/dist/types/dos/bundle/dos-conf";

declare const zip: any;

export interface JsDosZipData {
    executables: string[];
    dosboxConf?: string;
    config?: DosConfig;
}

export async function getZipData(data: Uint8Array): Promise<JsDosZipData> {
    const zipData: JsDosZipData = {
        executables: [],
    };
    const zipReader = new zip.ZipReader(new zip.Uint8ArrayReader(data), {
        Workers: false,
    });
    try {
        const entries = await zipReader.getEntries();
        for (const entry of entries) {
            const filename: string = entry.filename;
            if (filename.toLocaleLowerCase().endsWith(".com") ||
                filename.toLocaleLowerCase().endsWith(".exe") ||
                filename.toLocaleLowerCase().endsWith(".bat")) {
                zipData.executables.push(filename);
            }

            if (filename === ".jsdos/jsdos.json") {
                const config = await entry.getData(new zip.TextWriter(), { useWebWorkers: false });
                if (config.length > 0) {
                    zipData.config = JSON.parse(config);
                }
            }

            if (filename === ".jsdos/dosbox.conf") {
                const dosboxConf = await entry.getData(new zip.TextWriter(), { useWebWorkers: false });
                if (dosboxConf.length > 0) {
                    zipData.dosboxConf = dosboxConf;
                }
            }
        }

        return zipData;
    } finally {
        zipReader.close();
    }
}
