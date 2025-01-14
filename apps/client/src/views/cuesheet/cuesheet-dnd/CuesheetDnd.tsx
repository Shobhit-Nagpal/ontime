import { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ColumnDef } from '@tanstack/react-table';
import { OntimeRundown, OntimeRundownEntry } from 'ontime-types';

import { useEventAction } from '../../../common/hooks/useEventAction';
import useColumnManager from '../cuesheet-table/useColumnManager';

interface CuesheetDndProps {
  columns: ColumnDef<OntimeRundownEntry>[];
  setStatefulEntries: Dispatch<SetStateAction<OntimeRundown>>;
}

export default function CuesheetDnd(props: PropsWithChildren<CuesheetDndProps>) {
  const { columns, setStatefulEntries, children } = props;

  const { columnOrder, saveColumnOrder } = useColumnManager(columns);
  const { reorderEvent } = useEventAction();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 50,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 50,
      },
    }),
  );

  const handleOnDragEnd = (event: DragEndEvent) => {
    const { delta, active, over } = event;

    // cancel if delta y is greater than 200
    if (delta.y > 200) return;
    // cancel if we do not have an over id
    if (over?.id == null) return;

    // for row re-ordering
    if (active.data.current?.type === 'row') {
      const fromIndex = Number(active.id);
      const toIndex = Number(over.id);
        // ugly hack to handle inconsistencies between dnd-kit and async store updates
      setStatefulEntries((currentEntries) => {
        return arrayMove(currentEntries, fromIndex, toIndex);
      });
      reorderEvent(active.data.current?.idx, fromIndex, toIndex);
      return;
    }


    // get index of from
    const fromIndex = columnOrder.indexOf(active.id as string);

    // get index of to
    const toIndex = columnOrder.indexOf(over.id as string);

    if (toIndex === -1) {
      return;
    }

    const reorderedCols = [...columnOrder];
    const reorderedItem = reorderedCols.splice(fromIndex, 1);
    reorderedCols.splice(toIndex, 0, reorderedItem[0]);
    saveColumnOrder(reorderedCols);


  };


  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleOnDragEnd}>
      {children}
    </DndContext>
  );
}
