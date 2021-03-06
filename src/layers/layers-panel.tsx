import React from "react";

import { Button, ButtonGroup, Icon, Intent, PanelProps } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { EditorStackProps } from "./layers-editor";

import { t } from "../i18n";

export const LayersPanel: React.FC<PanelProps<EditorStackProps>> = (props) => {
    const { config, breadCrumbs } = props;
    function addNewLayer() {
        const newLayersConfig = { ...config };
        const newBreadCrumbs = { ...breadCrumbs };
        newBreadCrumbs.layer = newLayersConfig.layers.length;
        newLayersConfig.layers.push({
            grid: "honeycomb",
            title: "Layer#" + newBreadCrumbs.layer,
            controls: [{ row: 0, column: 9, symbol: "⚙", type: "Options" }],
        });

        props.setLayersConfig(newLayersConfig);
        props.setBreadCrumbs(newBreadCrumbs);
    }

    function editLayer(index: number) {
        const newBreadCrumbs = { ...breadCrumbs };
        newBreadCrumbs.layer = index;
        props.setBreadCrumbs(newBreadCrumbs);
    }


    function removeLayer(index: number) {
        const newLayersConfig = { ...config };
        newLayersConfig.layers.splice(index, 1);
        props.setLayersConfig(newLayersConfig);
    }

    function asJson() {
        const newBreadCrumbs = { ...breadCrumbs };
        newBreadCrumbs.asJson = true;
        props.setBreadCrumbs(newBreadCrumbs);
    }

    if (config.layers.length === 0) {
        return <div className="layers-empty">
            <Icon onClick={addNewLayer} icon={IconNames.INSERT} iconSize={52}></Icon>
            <div>{t("add_new_layer")}</div>
            {props.onClose === undefined ? null :
                <div className="layers-empty-close">
                    <Button minimal={true}
                        icon={IconNames.REDO}
                        intent={Intent.DANGER}
                        onClick={props.onClose}></Button>
                </div>
            }
        </div>;
    }

    return (
        <div className="layers-container">
            {config.layers.map((l, index) => {
                return <div className="layers-entry" key={"layer-" + l.title + "-" + index}>
                    <div className="layers-layer-title">{l.title}</div>
                    <ButtonGroup className="layers-actions">
                        <Button icon={IconNames.EDIT} onClick={() => editLayer(index)}>{t("edit")}</Button>
                        <Button icon={IconNames.TRASH}
                            minimal={true}
                            intent={Intent.DANGER}
                            onClick={() => removeLayer(index)}></Button>
                    </ButtonGroup>
                </div>;
            })}
            <div className="layers-controls">
                <Button icon={IconNames.INSERT} onClick={addNewLayer}>{t("add")}</Button>
                <span>&nbsp;</span>
                <Button icon={IconNames.EDIT} onClick={asJson}>{t("as_json")}</Button>
                <span>&nbsp;</span>
                <Button
                    icon={IconNames.TICK}
                    intent={Intent.SUCCESS}
                    onClick={() => props.onApply(config)}>{t("apply")}</Button>
                <span className="layers-container-spring"></span>
                {props.onClose === undefined ? null :
                    <Button icon={IconNames.REDO}
                        minimal={true}
                        intent={Intent.DANGER}
                        onClick={props.onClose}></Button>
                }
            </div>
        </div>
    );
};
