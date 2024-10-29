import { TableRow } from "@/components/ui/table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableTableRow({
  id,
  children,
}: {
  id: string;
  children: any;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={{ ...style }}
      {...attributes}
      {...listeners}
      tabIndex={-1}
    >
      {children}
    </TableRow>
  );
}
