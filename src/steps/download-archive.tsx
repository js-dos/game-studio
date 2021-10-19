import React, { useEffect, useState } from "react";

import { AnchorButton, Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { LayersConfig } from "emulators-ui/dist/types/controls/layers-config";
import { DosInstance } from "emulators-ui/dist/types/js-dos";
import { DosConfig } from "emulators/dist/types/dos/bundle/dos-conf";
import { Player } from "../player";
import { LayersEditor } from "../layers/layers-editor";
import { StepProps } from "../state";
import { createArchive } from "./create-archive";
import "./steps.css";

import { t } from "../i18n";


export function DownloadArchive(props: StepProps) {
    const { state, back } = props;
    const [url, setUrl] = useState<string>(() => {
        const blob = new Blob([state.bundle as Uint8Array], {
            type: "application/zip",
        });
        return URL.createObjectURL(blob);
    });
    const [bundleUrl, setBundleUrl] = useState<string | undefined>(url);
    const [dos, setDos] = useState<DosInstance | null>(null);
    const [config, setConfig] = useState<{ layersConfig?: LayersConfig }>(state.config as any || {});

    useEffect(() => {
        window.scrollTo(0, 0);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [url]);

    const onDownload = async () => {
        URL.revokeObjectURL(url);
        const archive = await createArchive(config as DosConfig, state.zip as Uint8Array);
        const blob = new Blob([archive], {
            type: "application/zip",
        });
        const newUrl = URL.createObjectURL(blob);
        const fileName = state.name + ".jsdos";

        const a = document.createElement("a");
        a.href = newUrl;
        a.download = fileName;
        a.style.display = "none";
        document.body.appendChild(a);

        a.click();
        a.remove();

        setUrl(newUrl);
    };

    const onStopStart = () => {
        if (bundleUrl) {
            setBundleUrl(undefined);
        } else {
            setBundleUrl(url);
        }
    };

    const gameTopicComponent = <AnchorButton
        href={"https://talks.dos.zone/search?expanded=true&q=" + encodeURIComponent((state.name || "") + " #en")}
        target="_blank"
        icon={IconNames.COMMENT}>{t("open_topic")}</AnchorButton>;

    function applyLayersConfig(layersConfig: LayersConfig) {
        if (dos === null) {
            return;
        }
        dos.setLayersConfig(layersConfig);
        const newConfig = { ...config };
        newConfig.layersConfig = layersConfig;
        setConfig(newConfig);
    }

    return <div className="download-archive-container">
        <div className="download-archive-actions">
            <Button onClick={back} icon={IconNames.ARROW_LEFT}>{t("back")}</Button>
            <Button onClick={onDownload}
                icon={IconNames.ARCHIVE}
                intent={Intent.PRIMARY}>{t("download")}</Button>
            <Button onClick={onStopStart}
                icon={bundleUrl ? IconNames.STOP : IconNames.PLAY}
                intent={bundleUrl ? Intent.WARNING : Intent.SUCCESS}>{bundleUrl ? t("stop") : t("start")}</Button>
        </div>
        <div className="download-archive-player-and-layers">
            <div className="download-archive-player">
                {bundleUrl === undefined ? null :
                    <Player
                        onDosInstance={setDos}
                        bundleUrl={bundleUrl} />
                }
            </div>
            <div className="download-archive-layers">
                <LayersEditor onApply={applyLayersConfig} layersConfig={config.layersConfig} />
            </div>
        </div>
        <div className="download-archive-actions">
            {gameTopicComponent}
        </div>

        <br />
        <div className="studio-bundle-url"><a href={decodeURIComponent(state.url || "#")}>source</a></div>
    </div>;
}
