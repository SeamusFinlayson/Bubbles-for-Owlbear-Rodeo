import OBR from "@owlbear-rodeo/sdk";
import { ThemeProvider } from "@mui/material";
import { getTheme } from "../OBRThemeProvider";
import parseSelectedTokens from "../parseSelectedTokens";
import { createRoot } from "react-dom/client";
import StatsMenuApp from "./component.tsx/StatsMenuApp";

OBR.onReady(async () => {

    const initialTokens = await parseSelectedTokens(false);

    const role = await OBR.player.getRole();

    const themeObject = await OBR.theme.getTheme();
    const theme = getTheme(themeObject);

    if (initialTokens.length !== 1) {
        throw "Error: Invalid Tokens Selection";
    } else {

        // Render React component
        const root = createRoot(document.getElementById("mother-flex") as HTMLDivElement);
        root.render(
            <ThemeProvider theme={theme}>
                <StatsMenuApp initialToken={initialTokens[0]} role={role}/>
            </ThemeProvider>
        );
    }
});

// async function setUpTheme() {

//     const theme = OBR.theme.getTheme();
//     if ((await theme).mode == "LIGHT") {

//         // Change text color
//         const labels = document.getElementsByClassName("label");
//         for (let i = 0; i < labels.length; i++) {
//             (labels[i] as HTMLLabelElement).style.color = "rgba(0, 0, 0, 0.8)";
//         }

//         const numberBoxes = document.getElementsByClassName("number-bubble");
//         for (let i = 0; i < numberBoxes.length; i++) {
//             numberBoxes[i].classList.replace("dark", "light");
//         }

//         (document.getElementById("divisor") as HTMLLabelElement).style.color = "black";

//         // Change stat outline color
//         const statBackgrounds = document.getElementsByClassName("stat-background");
//         console.log(statBackgrounds.length)
//         for (let i = 0; i < statBackgrounds.length; i++) {
//             statBackgrounds[i].classList.replace("dark", "light");
//         }

//         // Change grid background color
//         const grid = document.getElementsByClassName("stat-grid");
//         for (let i = 0; i < grid.length; i++) {
//             grid[i].classList.replace("dark", "light");
//         }

//         // Change hide switch background color
//         const hideSwitchRow = document.getElementsByClassName("hide-switch-row")
//         for (let i = 0; i < hideSwitchRow.length; i++) {
//             hideSwitchRow[i].classList.replace("dark", "light");
//         }

//     }
// }

// async function setUpInputs(setListeners: boolean = false) {

//     // Get selected Items
//     const selection = await OBR.player.getSelection();
//     const items = await OBR.scene.items.getItems(selection);

//     // Throw an error if more than 1 item is selected, this should not be possible
//     if (items.length > 1) {
//         throw "Error: Selection exceeded max length, expected 1, got: " + items.length;
//     }

//     const item = items.at(0);

//     if (typeof item === "undefined") {
//         throw "Error: No item selected";
//     }

//     // Fill inputs with previous data
//     for (const statInput of statInputs) {

//         let value: number | boolean;
//         let retrievedValue: boolean;

//         try {
//             value = JSON.parse(JSON.stringify(item.metadata[getPluginId("metadata")]))[statInput.id];
//             retrievedValue = true;
//         } catch (error) {
//             if (error instanceof TypeError || error instanceof SyntaxError) {
//                 value = 0;
//                 retrievedValue = false;
//             } else { throw error; }
//         }

//         if (typeof value === "undefined") {
//             retrievedValue = false;
//         }

//         // If a value was retrieved fill the input
//         if (retrievedValue) {

//             // Use validation appropriate to the input type
//             if (statInput.type === "CHECKBOX") {

//                 let checkbox = document.getElementById(statInput.id);
//                 if (checkbox !== null) {
//                     if (value !== null && typeof value === "boolean") {
//                         (document.getElementById(statInput.id) as HTMLInputElement).checked = value;
//                     } else {
//                         (document.getElementById(statInput.id) as HTMLInputElement).checked = false;
//                     }
//                 }

//             } else if (statInput.type === "TEXT") {

//                 // Fix bug where first value is read as a string instead of a number
//                 if (typeof value === "string") {
//                     value = parseFloat(value);
//                 }

//                 if (value !== null && typeof value === "number" && !isNaN(value)) {
//                     (document.getElementById(statInput.id) as HTMLInputElement).value = String(value);
//                 } else {
//                     (document.getElementById(statInput.id) as HTMLInputElement).value = String(0);
//                 }

//             } else {
//                 throw "Error: bad input type."
//             }
//         } else {

//             // Un-retrieved values get set to 0
//             if (statInput.type === "CHECKBOX") {
//                 let checkbox = document.getElementById(statInput.id);
//                 if (checkbox !== null) {
//                     (document.getElementById(statInput.id) as HTMLInputElement).checked = false;
//                 }
//             } else if (statInput.type === "TEXT") {
//                 (document.getElementById(statInput.id) as HTMLInputElement).value = String(0);
//             }
//         }

//         // Add change listeners to handle input changes
//         if (setListeners) {
//             document.getElementById(statInput.id)?.addEventListener("change", function () { handleInputChange(statInput.id, statInput.type) });
//         }
//     }

    // Must be called at end to have text pre-selected otherwise text will change after selection
    //selectHealthInput();
// }



// async function closePopoverOnEscapeKey() {

//     // attach keydown listener to close popover on escape key pressed
//     document.addEventListener("keydown", (event) => {
//         // var name = event.key;
//         // var code = event.code;
//         //console.log(`Key pressed ${name} \r\n Key code value: ${code}`); // log key pressed

//         if (event.key == "Escape") {
//             OBR.popover.close(getPluginId("number-bubbles"));
//         }
//     }, false);
// }

// async function selectHealthInput() {

//     // Select health input
//     (document.getElementById(statInputs[0].id) as HTMLInputElement)?.select();
// }