import React, { useState } from "react";
import { H1, H2, Classes, Intent, AnchorButton, Navbar, Alignment, Button, NavbarDivider } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import { State } from "./state";

import { InitFromFile } from "./steps/init-from-file";
import { InitFromUrl } from "./steps/init-from-url";
import { SelectExecutable } from "./steps/select-executable";
import { ConfigureDosbox } from "./steps/configure-dosbox";
import { DownloadArchive } from "./steps/download-archive";

import { parseQuery } from "./query-string";
import { t } from "./i18n";

import { EmulatorsUi } from "emulators-ui";
import { customAlphabet } from "nanoid/non-secure";

declare const emulatorsUi: EmulatorsUi;
const nanoid = customAlphabet("bcdfghjkmnpqrtwz", 5);

const localIdKey = "studio.token";
const commonSteps = [
    SelectExecutable,
    ConfigureDosbox,
    DownloadArchive,
];

export function GameStudio() {
    const storage = emulatorsUi.dom.storage;
    const queryParams = parseQuery(window.location.search);
    const url = queryParams.url;
    const setToken = (token: string) => {
        storage.setItem(localIdKey, token);
    };

    const [token] = useState<string>(() => {
        const storedId = storage.getItem(localIdKey);
        const token = storedId ?? nanoid();
        if (storedId === null) {
            setToken(token);
        }

        return token;
    });
    const [step, setStep] = useState<number>(1);
    const [state, setState] = useState<State>({
        token,
        setToken,

        url,
        canSkipArchiveCreation: false,
    });

    const props = {
        state,
        nextStep: (state: State) => {
            if (step === 1 && state.config !== undefined) {
                setState({ ...state, canSkipArchiveCreation: true });
                setStep(3);
            } else {
                setState(state);
                setStep(step + 1);
            }
        },
        back: () => {
            setStep(step - 1);
        },
        restart: () => {
            setState({ token, setToken, canSkipArchiveCreation: false });
            setStep(1);
        },
    };

    const steps = url === undefined ?
        [InitFromFile, ...commonSteps] :
        // eslint-disable-next-line new-cap
        [InitFromUrl(decodeURIComponent(url)), ...commonSteps];
    const stepComponent = React.createElement(steps[step - 1], props);

    function openRoot() {
        window.location.href = "/";
    }

    return <div>
        <Navbar fixedToTop={false}>
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading>
                    <Button icon={IconNames.ARROW_LEFT} minimal={true} onClick={openRoot}>DOS.Zone</Button>
                </Navbar.Heading>
                <NavbarDivider>
                    &nbsp;&nbsp;&nbsp;&nbsp;TOKEN: {token}
                </NavbarDivider>
            </Navbar.Group>
        </Navbar>
        <div style={{ padding: "20px", width: "100%" }}>
            {step === 1 ? <H1>{t("welcome")}</H1> : null}
            {step === 1 ?
                <p>
                    {t("description")}&nbsp;
                </p> : null}

            <div style={{ display: "flex", alignItems: "center" }}>
                <H2>{t("step")} {step}/{steps.length}</H2>
                <AnchorButton
                    style={{
                        marginLeft: "10px",
                        marginTop: "-20px",
                        visibility: (step > 1 ? "visible" : "hidden"),
                    }}
                    className={Classes.MINIMAL}
                    icon={IconNames.CROSS}
                    intent={Intent.DANGER}
                    onClick={() => props.restart()}></AnchorButton>
            </div>
            <div>
                {stepComponent}
            </div>
        </div>
    </div>;
}


