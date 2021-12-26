import { DosConfig } from "emulators/dist/types/dos/bundle/dos-conf";
import { Emulators } from "emulators";

import { JsDosZipData } from "./zip-explorer";

declare const emulators: Emulators;

export interface State {
    token: string,
    setToken: (token: string) => void,

    url?: string,
    name?: string,
    zip?: Uint8Array,
    executables?: string[],
    executable?: string,
    config?: DosConfig,
    bundle?: Uint8Array,
    canSkipArchiveCreation: boolean,
}

export interface StepProps {
    state: State,
    nextStep: (state: State) => void;
    back: () => void;
    restart: () => void;
}

export async function restoreConfig(jsdosZipData: JsDosZipData): Promise<DosConfig | undefined> {
    if (jsdosZipData.config !== undefined) {
        return jsdosZipData.config;
    }

    if (jsdosZipData.dosboxConf !== undefined && jsdosZipData.dosboxConf.length > 0) {
        const content = jsdosZipData.dosboxConf.split("\n");
        const index = content.indexOf("type jsdos~1/readme.txt");
        if (index < 0 || index + 3 >= content.length) {
            return undefined;
        }

        const dosBundle = await emulators.dosBundle();
        const config = dosBundle.config;
        config.autoexec.options.script.value = content[index + 3];
        return config;
    }

    return undefined;
}
