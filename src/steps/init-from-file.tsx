import React, { useState } from "react";

import { FileInput, InputGroup, Intent, Spinner, Button } from "@blueprintjs/core";
import { getZipData } from "../zip-explorer";
import { restoreConfig, StepProps } from "../state";
import { t } from "../i18n";
import { personalBundlePrefix } from "./config";

export function InitFromFile(props: StepProps) {
    const { state, nextStep } = props;
    const [error, setError] = useState<string>("");
    const [loadProgress, setLoadProgress] = useState<number>(0);
    const [reader, setReader] = useState<FileReader | null>(null);
    const [url, setUrl] = useState<string | null>(props.state.token);

    function onInputChange(e: any) {
        const files = e.currentTarget.files as FileList;
        if (files.length === 0) {
            setReader(null);
            return;
        }

        setError("");

        const file = files[0];
        const reader = new FileReader();
        reader.addEventListener("load", async (e) => {
            const zip = new Uint8Array(reader.result as ArrayBuffer);
            setLoadProgress(100);

            try {
                const jsdosZipData = await getZipData(zip);
                const name = file.name.substr(0, file.name.lastIndexOf("."));
                nextStep({
                    ...state,
                    name,
                    zip,
                    executables: jsdosZipData.executables,
                    config: await restoreConfig(jsdosZipData),
                });
            } catch (e) {
                setError(t("zip_error") + e);
                setReader(null);
                setLoadProgress(0);
            }
        });
        reader.addEventListener("progress", (e) => setLoadProgress(e.loaded / e.total));
        reader.readAsArrayBuffer(file);
        setReader(reader);
    }

    function onUrlChange(e: any) {
        setUrl(e.target.value || null);
    }

    function onLoadUrl(e: any) {
        if (url === null) {
            return;
        }

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            props.state.setToken(url);
            window.location.href = "/studio/?url=" + encodeURIComponent(personalBundlePrefix + url + "/bundle.jsdos");
        } else {
            window.location.href = "/studio/?url=" + encodeURIComponent(url);
        }
    }

    return <div>
        <p>
            {t("upload")}&nbsp;
            <span style={{ color: "#D9822B", fontWeight: "bold", borderBottom: "2px solid #DB3737" }}>ZIP</span>
            &nbsp;or&nbsp;
            <span style={{ color: "#D9822B", fontWeight: "bold", borderBottom: "2px solid #DB3737" }}>JsDos</span>
            &nbsp;{t("archive")} ({t("try")} <a href="https://caiiiycuk.github.io/dosify/digger.zip">digger.zip</a>)
        </p>
        <div style={{ display: "flex" }}>
            <FileInput disabled={reader !== null} text={t("choose_file")} onInputChange={onInputChange} />
            &nbsp;&nbsp;
            <Spinner size={16} intent={Intent.PRIMARY} value={loadProgress} />
        </div>
        <p>
            <span
                style={{ color: "#DB3737", display: (error.length === 0 ? "none" : "block") }}>*&nbsp;{error}</span>
        </p>
        <p>
            <strong>OR</strong>
        </p>
        <p>
            Enter&nbsp;
            <span style={{ color: "#D9822B", fontWeight: "bold", borderBottom: "2px solid #DB3737" }}>URL</span>
            &nbsp;or&nbsp;
            <span style={{ color: "#D9822B", fontWeight: "bold", borderBottom: "2px solid #DB3737" }}>TOKEN</span>
            &nbsp;to load jsdos bundle
        </p>
        <div style={{ display: "flex", flexDirection: "row" }}>
            <InputGroup
                value={url ?? ""}
                onChange={onUrlChange}
                fill={false}
                rightElement={<Button disabled={url === null}
                    intent={Intent.PRIMARY}
                    onClick={onLoadUrl}>Load</Button>} />
        </div>
    </div>;
};
