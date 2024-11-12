export function addThemeToBody(themeMode?: "DARK" | "LIGHT") {
  if (themeMode === undefined)
    themeMode = new URLSearchParams(document.location.search).get(
      "themeMode",
    ) as "DARK" | "LIGHT";
  if (themeMode === "DARK") document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}

export type InputColor = "RED" | "GREEN" | "BLUE";
