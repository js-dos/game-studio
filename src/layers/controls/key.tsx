import React, { useEffect, useState } from "react";

import { Button, ButtonGroup, FormGroup, HTMLSelect, InputGroup, IOptionProps } from "@blueprintjs/core";
import { LayerControl, LayerKeyControl } from "emulators-ui/dist/types/controls/layers-config";
import { EditorStackProps } from "../layers-editor";
import { getControl, getKeyCodeNameForCode, namedKeyCodes } from "./controls";

import { t } from "../../i18n";
import { IconNames } from "@blueprintjs/icons";

export const KeyControl: React.FC<EditorStackProps> = (props) => {
    const [optional, setControl] = useState<LayerKeyControl | null>(null);
    const [version, setVersion] = useState<number>(0);
    const options: IOptionProps[] = Object.keys(namedKeyCodes).map((key) => {
        return {
            label: mapKBDToShort(key),
            value: key,
        };
    });

    useEffect(() => {
        setControl(initDefault(getControl(props)));
    // eslint-disable-next-line
    }, [props.config.layers, props.breadCrumbs.layer, props.breadCrumbs.layerControl]);


    if (optional === null) {
        return null;
    }

    const control = optional;

    function onSymbolChange(event: any) {
        control.symbol = event.currentTarget.value;
        setVersion(version + 1);
    }

    function eventToKeyCode(event: any) {
        const key = event.currentTarget.value;
        return namedKeyCodes[key];
    }

    function onChangeKey(event: any, index: number) {
        control.mapTo[index] = eventToKeyCode(event);
        control.symbol = mapKBDToSymbol(getKeyCodeNameForCode(control.mapTo[0]));
        setVersion(version + 1);
    }

    function addKey() {
        control.mapTo.push(0);
        setVersion(version + 1);
    }

    function removeKey() {
        if (control.mapTo.length < 2) {
            return;
        }
        control.mapTo.pop();
        setVersion(version + 1);
    }

    return <div className="key-container">
        {
            control.mapTo.map((keyCode, index) => {
                return <FormGroup
                    key={"keyCode-" + index}
                    label={index === 0 ? t("key") : "+"}
                    inline={true}>
                    <HTMLSelect minimal={false}
                        options={options}
                        onChange={(e) => onChangeKey(e, index)}
                        value={getKeyCodeNameForCode(keyCode)} />
                </FormGroup>;
            })
        }
        <div style={{ display: "flex", alignItems: "baseline" }}>
            <p>Combintaion&nbsp;&nbsp;</p>
            <ButtonGroup>
                <Button onClick={addKey} icon={IconNames.PLUS}></Button>
                { control.mapTo.length > 1 ? <Button onClick={removeKey} icon={IconNames.MINUS}></Button> : null }
            </ButtonGroup>
        </div>
        <FormGroup
            label={t("symbol")}
            inline={true}>
            <InputGroup onChange={onSymbolChange} fill={false} value={control.symbol} />
        </FormGroup>
    </div>;
};

function initDefault(layerControl: LayerControl): LayerKeyControl {
    const control = layerControl as LayerKeyControl;
    control.symbol = control.symbol || mapKBDToSymbol("KBD_up");
    control.mapTo = control.mapTo || [namedKeyCodes.KBD_up];
    if (!Array.isArray(control.mapTo)) {
        control.mapTo = [control.mapTo];
    }
    return control;
}

function mapKBDToShort(kbd: string) {
    return kbd.substr(4);
}

const symbols: {[key: string]: string} = {
    up: "↑",
    down: "↓",
    left: "←",
    right: "→",
    kp8: "↑",
    kp2: "↓",
    kp4: "←",
    kp6: "→",
    esc: "␛",
    space: "␠",
    backspace: "␈",
    enter: "⏎",
    kpenter: "⏎",
};

function mapKBDToSymbol(kbd: string) {
    const short = mapKBDToShort(kbd);
    const symbol = symbols[short];
    if (symbol !== undefined) {
        return symbol;
    }
    return short;
}

