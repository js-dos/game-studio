import { DosConfig } from "emulators/dist/types/dos/bundle/dos-conf";
import { Emulators } from "emulators";
import { LayersConfig, LayerKeyControl } from "emulators-ui/dist/types/controls/layers-config";

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
    const config = await readConfigFromBundle(jsdosZipData) as any;
    if (config?.layersConfig !== undefined) {
        migrateV1ToV2(config.layersConfig);
    }
    return config;
}

export async function readConfigFromBundle(jsdosZipData: JsDosZipData): Promise<DosConfig | undefined> {
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

function migrateV1ToV2(config: LayersConfig) {
    for (const layer of config.layers) {
        for (const control of layer.controls) {
            if (control.type === "Key") {
                const keyControl = control as LayerKeyControl;
                if (typeof keyControl.mapTo === "number") {
                    keyControl.mapTo = [keyControl.mapTo];
                }
            }
        }
    }

    if (config.version === 1) {
        config.version = 2;
    }
}
