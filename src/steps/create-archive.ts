import { Emulators } from "emulators";
import { DosInstance } from "emulators-ui/dist/types/js-dos";
import { DosConfig } from "emulators/dist/types/dos/bundle/dos-conf";

declare const emulators: Emulators;

export async function createArchive(config: DosConfig, zip: Uint8Array, instance: DosInstance | null) {
    const dosBundle = await emulators.dosBundle();
    dosBundle.config = config;

    const blob = new Blob([zip as Uint8Array]);
    const url = URL.createObjectURL(blob);
    dosBundle
        .extract(url);

    let changesUrl: string | null = null;
    if (instance?.ciPromise !== undefined) {
        const changes = await (await instance.ciPromise).persist();
        const changesBlob = new Blob([changes]);
        changesUrl = URL.createObjectURL(changesBlob);
        dosBundle.extract(changesUrl);
    }

    const archive = await dosBundle.toUint8Array(true);

    URL.revokeObjectURL(url);
    if (changesUrl !== null) {
        URL.revokeObjectURL(changesUrl);
    }

    return archive;
}
