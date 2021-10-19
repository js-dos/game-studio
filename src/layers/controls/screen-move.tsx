import React, { useEffect, useState } from "react";

import { LayerControl, LayerScreenMoveControl } from "emulators-ui/dist/types/controls/layers-config";

import { EditorStackProps } from "../layers-editor";
import { getControl } from "./controls";
import { HTMLSelect, FormGroup } from "@blueprintjs/core";

import { t } from "../../i18n";

export const ScreenMoveControl: React.FC<EditorStackProps> = (props) => {
    const [optional, setControl] = useState<LayerScreenMoveControl | null>(null);
    const [version, setVersion] = useState<number>(0);

    useEffect(() => {
        setControl(initDefault(getControl(props)));
    // eslint-disable-next-line
    }, [props.config.layers, props.breadCrumbs.layer, props.breadCrumbs.layerControl]);


    if (optional === null) {
        return null;
    }

    const control = optional;

    function onDirectionChange(event: any) {
        control.direction = event.currentTarget.value;
        control.symbol = symbols[control.direction];
        setVersion(version + 1);
    }

    return <div className="key-container">
        <FormGroup
            label={t("direction")}
            inline={true}>
            <HTMLSelect minimal={false}
                options={Object.keys(symbols)}
                onChange={onDirectionChange}
                value={control.direction} />
        </FormGroup>
    </div>;
};

function initDefault(layerControl: LayerControl): LayerScreenMoveControl {
    const control = layerControl as LayerScreenMoveControl;
    control.direction = "up";
    control.symbol = symbols[control.direction];
    return control;
}

const symbols: {[key: string]: string} = {
    "up": "↑",
    "down": "↓",
    "left": "←",
    "right": "→",
    "up-left": "↖",
    "up-right": "↗",
    "down-left": "↙",
    "down-right": "↘",
};

