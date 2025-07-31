import { TooltipProvider } from "@/components/ui/tooltip";
import BulkEditor from "./BulkEditor";

export default function App() {
  return (
    <TooltipProvider
      disableHoverableContent
      skipDelayDuration={0}
      delayDuration={400}
    >
      <BulkEditor />
    </TooltipProvider>
  );
}
