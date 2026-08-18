// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
let code = fs.readFileSync('src/components/admin/master-plan-client.tsx', 'utf8');

const planCardEnd = code.indexOf('function EmptyColumn');
const sortableCardCode = `
export function SortablePlanCard({ item, compact, onOpen, pendingDependencies }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { item }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PlanCard item={item} compact={compact} onOpen={onOpen} pendingDependencies={pendingDependencies} />
    </div>
  );
}
`;
code = code.slice(0, planCardEnd) + sortableCardCode + '\n' + code.slice(planCardEnd);

const hookPoint = code.indexOf('const completedIds = useMemo');
const dndHooks = `
  const [isPending, startTransition] = useTransition();
  const [activeItem, setActiveItem] = useState<PlanItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active.data.current?.item as PlanItem);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    const item = items.find(i => i.id === activeId);
    if (!item) return;
    
    let targetStatus: "pending" | "paused" | "completed" | null = null;
    if (["col-pending", "col-paused", "col-completed"].includes(overId)) {
       targetStatus = overId.replace("col-", "") as any;
    } else {
       const overItem = items.find(i => i.id === overId);
       if (overItem) targetStatus = overItem.status;
    }

    if (targetStatus && targetStatus !== item.status) {
       startTransition(async () => {
          try {
             await updatePlanItemStatus(activeId, targetStatus);
          } catch (e) {
             console.error("Failed to update status", e);
          }
       });
    }
  };
`;
code = code.slice(0, hookPoint) + dndHooks + '\n  ' + code.slice(hookPoint);

const kanbanStart = code.indexOf('{viewMode === "kanban" && (');
const kanbanEnd = code.indexOf('{/* List View */}');

const kanbanReplacement = `{viewMode === "kanban" && (
  <DndContext 
    sensors={sensors} 
    collisionDetection={closestCorners} 
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}
  >
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      
      {/* Pending Column */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-fg-primary flex items-center gap-2 font-bold">
            <Clock className="text-warning-400 h-5 w-5" />
            {t("pending_column")}
          </h3>
          <span className="bg-bg-tertiary text-fg-muted rounded-full px-2.5 py-0.5 text-xs font-bold">
            {pendingItems.length}
          </span>
        </div>
        <SortableContext id="col-pending" items={pendingItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[150px]">
            {pendingItems.length === 0 ? (
              <EmptyColumn icon={<Clock className="h-6 w-6 opacity-40" />} label={t("no_pending_items")} />
            ) : (
              <AnimatePresence initial={false}>
                {pendingItems.map((item) => (
                  <SortablePlanCard key={item.id} item={item} onOpen={setSelected} pendingDependencies={Array.from(effectiveDependsOn.get(item.id) || []).filter((d) => !completedIds.has(d))} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </SortableContext>
      </div>

      {/* Paused Column */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-fg-primary flex items-center gap-2 font-bold">
            <Clock className="text-brand-400 h-5 w-5" />
            {t("paused_column")}
          </h3>
          <span className="bg-bg-tertiary text-fg-muted rounded-full px-2.5 py-0.5 text-xs font-bold">
            {pausedItems.length}
          </span>
        </div>
        <SortableContext id="col-paused" items={pausedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[150px]">
            {pausedItems.length === 0 ? (
              <EmptyColumn icon={<Clock className="h-6 w-6 opacity-40" />} label={t("no_paused_items")} />
            ) : (
              <AnimatePresence initial={false}>
                {pausedItems.map((item) => (
                  <SortablePlanCard key={item.id} item={item} onOpen={setSelected} pendingDependencies={Array.from(effectiveDependsOn.get(item.id) || []).filter((d) => !completedIds.has(d))} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </SortableContext>
      </div>

      {/* Completed Column */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-fg-primary flex items-center gap-2 font-bold">
            <CheckCircle2 className="text-success-400 h-5 w-5" />
            {t("completed_column")}
          </h3>
          <span className="bg-bg-tertiary text-fg-muted rounded-full px-2.5 py-0.5 text-xs font-bold">
            {completedItems.length}
          </span>
        </div>
        <SortableContext id="col-completed" items={completedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[150px] opacity-60 transition-opacity hover:opacity-100">
            {completedItems.length === 0 ? (
              <EmptyColumn icon={<CheckCircle2 className="h-6 w-6 opacity-40" />} label={t("no_completed_items")} />
            ) : (
              <AnimatePresence initial={false}>
                {completedItems.map((item) => (
                  <SortablePlanCard compact key={item.id} item={item} onOpen={setSelected} pendingDependencies={Array.from(effectiveDependsOn.get(item.id) || []).filter((d) => !completedIds.has(d))} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </SortableContext>
      </div>

    </div>
    <DragOverlay>
      {activeItem ? <PlanCard item={activeItem} onOpen={setSelected} /> : null}
    </DragOverlay>
  </DndContext>
)}

              `;

code = code.slice(0, kanbanStart) + kanbanReplacement + code.slice(kanbanEnd);

fs.writeFileSync('src/components/admin/master-plan-client.tsx', code);
