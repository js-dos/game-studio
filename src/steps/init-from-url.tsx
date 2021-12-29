import React, { useEffect, useState } from "react";

import { Spinner } from "@blueprintjs/core";
import { getZipData } from "../zip-explorer";
import { restoreConfig, StepProps } from "../state";
import { cdnUrl } from "../config";
import { getBuffer } from "../xhr";

import { t } from "../i18n";

export function InitFromUrl(url: string) {
    return function InitFromUrlSteps(props: StepProps) {
        const { state } = props;
        const [error, setError] = useState<string>("");

        useEffect(() => {
            if (url === undefined) {
                return;
            }

            let cancel = false;
            getBuffer(cdnUrl(url))
                .then(async (data) => {
                    if (cancel) {
                        return;
                    }

                    const zip = new Uint8Array(data);
                    try {
                        const jsdosZipData = await getZipData(zip);
                        if (cancel) {
                            return;
                        }

                        props.nextStep({
                            ...state,
                            name: "bundle",
                            zip,
                            executables: jsdosZipData.executables,
                            config: await restoreConfig(jsdosZipData),
                        });
                    } catch (e) {
                        setError(t("zip_error") + e);
                    }
                })
                .catch((e) => {
                    if (cancel) {
                        return;
                    }

                    setError(e.message);
                });

            return () => {
                cancel = true;
            };

        // eslint-disable-next-line
        }, []);

        if (error.length > 0) {
            return <div>
                <p>
                    <span style={{ color: "#DB3737", display: (error.length === 0 ? "none" : "block") }}>
                        *&nbsp;{error}
                    </span>
                </p>
            </div>;
        }

        return <div>
            {t("loading")}
            <div style={{ display: "flex", marginTop: "12px" }}><Spinner /></div>
        </div>;
    };
}
