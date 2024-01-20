import { grey } from "@mui/material/colors";
import { Theme as MuiTheme, createTheme } from "@mui/material/styles";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import OBR, { Theme } from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

/**
 * Create a MUI theme based off of the current OBR theme
 */
export function getTheme(theme?: Theme) {
    return createTheme({
        palette: theme
            ? {
                mode: theme.mode === "LIGHT" ? "light" : "dark",
                text: theme.text,
                primary: theme.primary,
                secondary: theme.secondary,
                background: theme?.background,
                
            }
            : undefined,
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiButtonBase: {
                defaultProps: {
                    disableRipple: true,
                },
            },
            MuiTextField: {
                defaultProps: {
                    // color:"secondary",
                    variant: "outlined",
                    size:"small",
                    sx: {
                        marginTop:1,
                        // p:0.2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        // border: "none",
                        textJustify:"center",
                        width:1,
                        input: {
                            textAlign:"center",
                        }
                    },
                    InputLabelProps: {
                        // shrink:false,
                        // disabled:true
                        
                    },
                    margin:"dense"
                    // fullWidth:false,
                }
            },
            MuiPaper: {
                defaultProps: {
                    elevation: 2,
                    sx: {
                        // borderRadius: 12,
                    }
                    // variant:"outlined"
                }
            },
            MuiRadio: {
                defaultProps: {
                    // color:"secondary",
                    sx: {
                        color: grey[500],
                    },
                }
            },
            MuiTooltip: {
                defaultProps: {
                    disableInteractive: true
                }
            }
        },
    });
}

/**
 * Provide a MUI theme with the same palette as the parent OBR window
 * WARNING: Doesn't work well for popover because it creates a flash when loading
 */
export function OBRThemeProvider({
    children,
}: {
    children?: React.ReactNode;
}) {
    const [theme, setTheme] = useState<MuiTheme>(() => getTheme());
    useEffect(() => {
        const updateTheme = (theme: Theme) => {
            setTheme(getTheme(theme));
        };
        OBR.theme.getTheme().then(updateTheme);
        return OBR.theme.onChange(updateTheme);
    }, []);

    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}