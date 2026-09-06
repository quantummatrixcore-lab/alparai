"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type IncidentStatus = "published" | "investigating" | "resolved";

export type KanbanIncident = {
  id: string;
  title: string;
  severity: string;
  status: IncidentStatus;
  date: string;
};

type KanbanBoardProps = {
  incidents: KanbanIncident[];
  onStatusChange: (id: string, newStatus: IncidentStatus) => void;
};

const STATUS_COLUMNS: {
  id: IncidentStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "published",
    label: "Yeni İhlaller",
    icon: <AlertCircle className="text-danger-400 h-4 w-4" />,
    color: "border-danger-500/30",
  },
  {
    id: "investigating",
    label: "İnceleniyor",
    icon: <Clock className="text-warning-400 h-4 w-4" />,
    color: "border-warning-500/30",
  },
  {
    id: "resolved",
    label: "Yanıtlandı / Çözüldü",
    icon: <CheckCircle2 className="text-success-400 h-4 w-4" />,
    color: "border-success-500/30",
  },
];

function SortableIncidentCard({ incident }: { incident: KanbanIncident }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: incident.id,
    data: { ...incident },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-bg-secondary border-border-subtle hover:border-border-strong cursor-grab rounded-xl border p-4 shadow-sm transition-colors",
        isDragging && "ring-brand-500 ring-offset-bg-primary z-50 opacity-50 ring-2 ring-offset-2",
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <Badge
          variant={
            incident.severity === "critical"
              ? "danger"
              : incident.severity === "high"
                ? "warning"
                : "default"
          }
        >
          {incident.severity}
        </Badge>
        <span className="text-fg-muted text-xs">
          {new Date(incident.date).toLocaleDateString()}
        </span>
      </div>
      <h4 className="text-fg-primary line-clamp-2 text-sm font-bold">{incident.title}</h4>
    </div>
  );
}

export function KanbanBoard({ incidents: initialIncidents, onStatusChange }: KanbanBoardProps) {
  const [items, setItems] = useState<KanbanIncident[]>(initialIncidents);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItem = items.find((i) => i.id === active.id);
    const overId = over.id;

    if (!activeItem) return;

    // Check if dropping on a column
    const isOverColumn = STATUS_COLUMNS.some((col) => col.id === overId);

    let newStatus = activeItem.status;
    if (isOverColumn) {
      newStatus = overId as IncidentStatus;
    } else {
      const overItem = items.find((i) => i.id === overId);
      if (overItem) {
        newStatus = overItem.status;
      }
    }

    if (activeItem.status !== newStatus) {
      setItems((prev) =>
        prev.map((item) => (item.id === active.id ? { ...item, status: newStatus } : item)),
      );
      onStatusChange(String(active.id), newStatus);
    } else if (active.id !== over.id && !isOverColumn) {
      // Optional sorting inside the same column
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
  };

  const activeIncident = items.find((i) => i.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {STATUS_COLUMNS.map((column) => (
          <div
            key={column.id}
            className={cn("bg-bg-tertiary/30 rounded-2xl border p-4", column.color)}
          >
            <div className="mb-4 flex items-center gap-2 px-2">
              {column.icon}
              <h3 className="text-fg-primary font-bold">{column.label}</h3>
              <span className="text-fg-muted ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs">
                {items.filter((i) => i.status === column.id).length}
              </span>
            </div>

            <SortableContext
              id={column.id}
              items={items.filter((i) => i.status === column.id).map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex min-h-[500px] flex-col gap-3">
                {items
                  .filter((i) => i.status === column.id)
                  .map((incident) => (
                    <SortableIncidentCard key={incident.id} incident={incident} />
                  ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeIncident ? <SortableIncidentCard incident={activeIncident} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
