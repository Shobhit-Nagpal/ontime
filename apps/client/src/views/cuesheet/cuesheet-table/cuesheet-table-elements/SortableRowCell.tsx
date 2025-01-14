import { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';

interface SortableBodyCellProps {
  rowId: string;
  children: ReactNode;
}

export function SortableRowCell({ rowId, children }: SortableBodyCellProps) {
  const { attributes, listeners } = useSortable({
    id: rowId,
  });

  return (
    <div {...attributes} {...listeners}>
      {children}
    </div>
  );
}
