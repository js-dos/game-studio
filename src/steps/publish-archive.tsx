import React, { useEffect, useState } from "react";

import { AnchorButton, Button, ButtonGroup, InputGroup, Intent, Spinner } from "@blueprintjs/core";
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
import { postObject, send } from "../xhr";
import { presonalBundlePut, personalBundleAcl, personalBundlePrefix } from "./config";

const isNative = (window as any).hardware !== undefined;

export function PublishArchive(props: StepProps) {
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
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [showPersonalUrl, setShowPersonalUrl] = useState<boolean>(false);
    const [publishUrl, setPublishUrl] = useState<string>(state.url || "");
    const [publishToken, setPublishToken] = useState<string>("");
    const personalUrl = personalBundlePrefix + props.state.token + "/bundle.jsdos";

    useEffect(() => {
        window.scrollTo(0, 0);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [url]);

    const onDownload = async () => {
        setUploading(true);
        setUploadProgress(0);

        URL.revokeObjectURL(url);
        const archive = await createArchive(config as DosConfig, state.zip as Uint8Array, dos);
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
        setUploading(false);
    };

    async function doUpload(rawUrl: string, publishToken?: string) {
        setError(null);
        setUploadProgress(0);
        setUploading(true);
        setShowPersonalUrl(false);

        try {
            const token = props.state.token;
            const uploadUrl = encodeURIComponent(rawUrl);
            const archive = await createArchive(config as DosConfig, state.zip as Uint8Array, dos);
            const publisTokenParam = (publishToken === undefined ? "" :
                "&publishToken=" + encodeURIComponent(publishToken));
            const result = await postObject(presonalBundlePut + "?namespace=studio&id=" +
            token + "&bundleUrl=" + uploadUrl + publisTokenParam);

            if (!result.success) {
                throw new Error("Unable to put personal bundle: " + result.errorCode);
            }

            const payload = JSON.parse(result.payload);

            if (payload.errorMessage !== undefined) {
                throw new Error(payload.errorMessage);
            }

            const headers = payload.signature as { [name: string]: string };
            const url = payload.url as string;

            headers["x-amz-content-sha256"] = "UNSIGNED-PAYLOAD";
            await send("put",
                url,
                "text",
                archive.buffer,
                setUploadProgress,
                headers);

            if (!(await postObject(personalBundleAcl + "?namespace=studio&id=" +
                token + "&bundleUrl=" + uploadUrl + publisTokenParam)).success) {
                throw new Error("Can't set ACL to personal bundle:");
            }

            setShowPersonalUrl(true);
        } catch (e: any) {
            setError(e.message);
        }

        setUploading(false);
    };

    const onUpload = async () => {
        await doUpload(personalBundlePrefix + "bundle.jsdos");
    };

    const onPublish = async () => {
        await doUpload(publishUrl, publishToken);
    };

    const onStopStart = () => {
        if (bundleUrl) {
            setBundleUrl(undefined);
        } else {
            setBundleUrl(url);
        }
    };

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
            { isNative ? null :
                <Button onClick={onStopStart}
                    icon={bundleUrl ? IconNames.STOP : IconNames.PLAY}
                    intent={bundleUrl ? Intent.WARNING : Intent.SUCCESS}>{bundleUrl ? t("stop") : t("start")}</Button> }
            <ButtonGroup>
                <Button onClick={onUpload}
                    icon={IconNames.CLOUD_UPLOAD}
                    disabled={uploading}
                    intent={Intent.PRIMARY}>{ uploading ?
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Spinner size={16} />&nbsp;&nbsp;{uploadProgress}%
                        </div> :
                        t("download") }</Button>
                { isNative ? null :
                    <Button onClick={onDownload}
                        disabled={uploading}
                        icon={IconNames.ARCHIVE}></Button> }
                <AnchorButton
                    href="https://talks.dos.zone/"
                    target="_blank"
                    intent={Intent.SUCCESS}
                    icon={IconNames.SEND_MESSAGE} />
            </ButtonGroup>
        </div>
        { error !== null ? <div style={{ color: "#C23030" }}>Unexpected error: {error}</div> : null }
        {
            showPersonalUrl ?
                <div>
                    Cloud URL: <a href={personalUrl} rel="noreferrer" target="_blank">{personalUrl}</a>
                </div> :
                null
        }
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

        <div>
            <h3>Publish to</h3>
            <InputGroup className="not-prevent-key-events" value={publishUrl} fill={false}
                leftIcon={IconNames.SHARE}
                onChange={(e) => {
                    setPublishUrl(e.currentTarget.value);
                }} />
            <br/>
            <h3>Token</h3>
            <InputGroup className="not-prevent-key-events" type="password" value={publishToken}
                leftIcon={IconNames.LOCK} placeholder="Publish token..."
                onChange={(e) => {
                    setPublishToken(e.currentTarget.value);
                }}/>
            <br/>
            <Button intent={Intent.DANGER}
                disabled={publishUrl.length === 0 || publishToken.length === 0}
                onClick={onPublish}>
                Publish
            </Button>
        </div>
    </div>;
}
