import { CSSProperties, ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Row } from '@tanstack/react-table';
import { OntimeEvent, OntimeRundownEntry } from 'ontime-types';

import styles from '../CuesheetTable.module.scss';

interface SortableBodyCellProps {
  row: Row<OntimeRundownEntry>;
  event: OntimeEvent;
  style: CSSProperties;
  children: ReactNode;
}

export function SortableRow({ row, event, style, children }: SortableBodyCellProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    data: {
      type: 'row',
      idx: event.id,
    },
  });

  // build drag styles
  const dragStyle = {
    ...style,
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={dragStyle}>
      <td {...attributes} {...listeners}>
        {children}
      </td>
      <td className={styles.resizer} />
    </tr>
  );
}
