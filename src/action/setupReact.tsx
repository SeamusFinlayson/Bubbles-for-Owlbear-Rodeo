import { createRoot } from "react-dom/client";
import HeaderButton from "./components/HeaderButton";

export default async function setupReact() {
  // Render React component
  const patreonButton = createRoot(
    document.getElementById("patreon-button") as HTMLDivElement,
  );
  patreonButton.render(<HeaderButton variant="patreon"></HeaderButton>);

  // Render React component
  const changeLogButton = createRoot(
    document.getElementById("change-log-button") as HTMLDivElement,
  );
  changeLogButton.render(<HeaderButton variant="changeLog"></HeaderButton>);

  // Render React component
  const instructionsButton = createRoot(
    document.getElementById("help-button") as HTMLDivElement,
  );
  instructionsButton.render(<HeaderButton variant="help"></HeaderButton>);
}
