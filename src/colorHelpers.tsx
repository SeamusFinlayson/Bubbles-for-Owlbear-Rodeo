export function addThemeToBody() {
  const themeMode = new URLSearchParams(document.location.search).get(
    "themeMode",
  );
  console.log(themeMode);
  if (themeMode === "DARK") document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}

export function getBackgroundColor(colorNumber: number) {
  let color: string;
  switch (colorNumber % 3) {
    default:
    case 0:
      color = "bg-stat-light-health dark:bg-stat-dark-health";
      break;
    case 1:
      color = "bg-stat-light-temp dark:bg-stat-dark-temp";
      break;
    case 2:
      color = "bg-stat-light-armor dark:bg-stat-dark-armor";
      break;
  }
  return color;
}

export function getColor(colorNumber: number) {
  let color: string;
  switch (colorNumber % 9) {
    default:
    case 0:
      color = "#9c43b2";
      break;
    case 1:
      color = "#af2d6c";
      break;
    case 2:
      color = "#ab2022";
      break;
    case 3:
      color = "#c85217";
      break;
    case 4:
      color = "#a58421";
      break;
    case 5:
      color = "#6d9142";
      break;
    case 6:
      color = "#378873";
      break;
    case 7:
      color = "#5092a3";
      break;
    case 8:
      color = "#4064a4";
      break;
  }
  return color;
}
