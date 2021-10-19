import React from "react";
import ReactDOM from "react-dom";
import { GameStudio } from "./game-studio";
import reportWebVitals from "./reportWebVitals";

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

ReactDOM.render(
    <React.StrictMode>
        <GameStudio />
    </React.StrictMode>,
    document.getElementById("root"),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
