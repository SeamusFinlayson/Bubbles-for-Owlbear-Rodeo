import { Box, Paper} from "@mui/material";
import { Token } from "../Token";
import HealthBar from "./HealthBar";

export default function TokenList({ tokensProp, addedHealth }: any): JSX.Element {

    const tokens: Token[] = tokensProp;

    const tokenElements: JSX.Element[] = [];

    for (let i = 0; i < tokens.length; i++) {
        tokenElements.push(
            <Paper elevation={3} sx={{
                p: 1,
                borderRadius: "8px"
            }}>
                <Box
                    sx={{
                        display: "grid",
                        alignItems: "center",
                        justifyItems: "center",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px"
                    }}
                >
                    <Box sx={{ gridColumn: "span 2", algin: "center", justifyContent: "center" }}>
                        {tokens[i].item.name}
                    </Box>
                    <Box sx={{ zIndex: 0, gridRow: "2/3", gridColumn: "1/2", justifySelf: "center", alignSelf: "stretch" }}>
                        <HealthBar
                            health={tokens[i].health}
                            maxHealth={tokens[i].maxHealth}
                            addedHealth={addedHealth}
                        ></HealthBar>
                    </Box>
                    <Box>
                        {tokens[i].tempHealth.toString()}
                    </Box>

                </Box>
            </Paper>
        );
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            m: 1,
            p: 1,
            borderRadius: 1,
            bgcolor: "background.default",
            height: "400px",
            overflowY: "scroll",
            gap: "8px"
        }}>
            {tokenElements}
        </Box>
    );
}

// function NewTokensFrame() {

//     const radioValues: number[] = []
//     const setRadioValues: React.Dispatch<React.SetStateAction<number>>[] = []

//     for (let i = 0; i < validTokens.length; i++) {
//         [radioValues[i], setRadioValues[i]] = useState(2);
//     }

//     function updateRadioValue(name: number, value: number) {
//         // console.log("Name: " + name + " Value: " + value);
//         setRadioValues[name](value);
//     }

//     return (
//         <Box className="tokens-frame" style={{ justifySelf: "end" }} sx={tokensFrameStyle}>
//             <div className="token-list">
//                 <NewTokenListHeader></NewTokenListHeader>
//                 <NewTokenList radioValues={radioValues}></NewTokenList>
//                 {/* <p>Count: {validTokens.length}</p> */}
//             </div>
//             <RadioColumns radioValues={radioValues} updateRadioValue={updateRadioValue}></RadioColumns>
//         </Box>
//     );
// }

// function RadioColumns({ radioValues, updateRadioValue }: any) {

//     const headers: JSX.Element[] = [
//         <Tooltip title="Immune" placement="top"><p style={{ paddingBottom: "3px" }}>&#x2573;</p></Tooltip>,
//         <Tooltip title="Resistant" placement="top"><p>&#xBD;</p></Tooltip>,
//         <Tooltip title="Normal" placement="top"><p>&times;1</p></Tooltip>,
//         <Tooltip title="Vulnerable" placement="top"><p>&times;2</p></Tooltip>,

//     ];

//     const headerRow: JSX.Element = <div className="setting-token-list-header">
//         {headers}
//     </div>;

//     let radioColumn: JSX.Element[] = [];
//     radioColumn.push(headerRow);

//     let radioRow: JSX.Element[];


//     for (let i = 0; i < validTokens.length; i++) {
//         radioRow = [];
//         for (let n = 0; n < headers.length; n++) {
//             radioRow.push(
//                 <Radio
//                     checked={radioValues[i] === n}
//                     onChange={evt => updateRadioValue(parseFloat(evt.target.name), parseFloat(evt.target.value))}
//                     value={n.toString()}
//                     name={i.toString()}
//                     inputProps={{ 'aria-label': 'A' }}
//                 />
//             );
//         }
//         radioColumn.push(<div className="radio-row">
//             {radioRow}
//         </div>);
//     }

//     return (<div className="token-list setting">
//         {radioColumn}
//     </div>);
// }

// function NewTokenListHeader() {
//     return (
//         <div className="new-token-list-header">
//             <p>HP</p>
//             <p>max</p>
//             <p>Temp</p>
//         </div >
//     );
// }

// function NewTokenList({ radioValues }: any) {
//     let elements = [];
//     for (let i = 0; i < validTokens.length; i++) {
//         elements.push(
//             <NewTokenElement token={validTokens[i]} radioValue={radioValues[i]}></NewTokenElement>
//         );
//     }

//     return (elements);
// }

// function NewTokenElement({ token, radioValue }: any) {

//     const addedHealth = useContext(AddedHealthContext);
//     // console.log("Radio state: " + radioValue)

//     let scaledAddedHealth;

//     switch (radioValue) {
//         case 0:
//             scaledAddedHealth = 0;
//             break;
//         case 1:
//             scaledAddedHealth = Math.trunc(addedHealth / 2);

//             break;
//         case 2:
//             scaledAddedHealth = addedHealth;

//             break;
//         case 3:
//             scaledAddedHealth = addedHealth * 2;
//             break;
//         default:
//             throw ("Error: Invalid radio button value.")
//             break;
//     }

//     let newHealth = token.health;
//     let newTempHealth = token.tempHealth;
//     if (scaledAddedHealth > 0) {
//         newHealth = token.health + scaledAddedHealth;
//         newHealth = (newHealth > token.maxHealth) ? token.maxHealth : newHealth;
//     } else {
//         if (token.tempHealth > 0) {
//             newTempHealth = token.tempHealth + scaledAddedHealth;
//             if (newTempHealth < 0) {
//                 newHealth = token.health + newTempHealth;
//                 newTempHealth = 0;
//             }
//         } else {
//             newHealth = token.health + scaledAddedHealth;
//         }
//     }

//     let healthColorStyle = { color: "lightgreen" };
//     if (newHealth < token.maxHealth / 4) {
//         healthColorStyle = { color: "#ff4040" };
//     } else if (newHealth < token.maxHealth / 2) {
//         healthColorStyle = { color: "yellow" };
//     }

//     let tempHealthColorStyle = { color: "text" };
//     if (newTempHealth > 0) {
//         tempHealthColorStyle = { color: "lightgreen" };
//     }

//     return (
//         <Paper className="new-token-element" style={{ gridTemplateColumns: "repeat(3,50px)" }} sx={tokenElementStyle}>
//             <p style={healthColorStyle}>{newHealth}</p>
//             <p>{token.maxHealth}</p>
//             <p style={tempHealthColorStyle}>{newTempHealth}</p>
//         </Paper>
//     )
// }