import React from "react";
import ReactDOM from "react-dom";
import { GameStudio } from "./game-studio";

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";


ReactDOM.render(
    <React.StrictMode>
        <GameStudio />
    </React.StrictMode>,
    document.getElementById("root"),
);

