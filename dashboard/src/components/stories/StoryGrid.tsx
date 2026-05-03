import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Story, getStatus } from '@/data/mockStories';
import { StoryCard, StoryCardSkeleton } from './StoryCard';

interface StoryGridProps {
  stories: Story[];
  loading?: boolean;
  focusedId?: string | null;
  onFocus?: (id: string) => void;
  /**
   * Called when the user drops a published card in a new position.
   * Receives the moved story + the proposed new displayOrder slot.
   * Parent should open the ReorderConfirmDialog and either commit or
   * revert the move.
   */
  onReorderRequested?: (story: Story, newDisplayOrder: number) => void;
  onPublish?: (story: Story) => void;
  onDelete?: (story: Story) => void;
}

/**
 * Responsive grid: 4 cols `lg+`, 2 cols `md`, 1 col mobile. Published
 * stories share a SortableContext so they can be drag-reordered; non-
 * published cards render normally and don't participate in DnD.
 */
export function StoryGrid({
  stories,
  loading = false,
  focusedId,
  onFocus,
  onReorderRequested,
  onPublish,
  onDelete,
}: StoryGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const publishedIds = stories.filter((s) => getStatus(s) === 'published').map((s) => s.id);

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    if (!onReorderRequested) return;

    // Find the moved story and its target neighbor in the published group.
    const moved = stories.find((s) => s.id === active.id);
    const target = stories.find((s) => s.id === over.id);
    if (!moved || !target) return;
    if (getStatus(moved) !== 'published' || getStatus(target) !== 'published') return;

    onReorderRequested(moved, target.displayOrder);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={publishedIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stories.map((story) => {
            const status = getStatus(story);
            if (status === 'published') {
              return (
                <SortableStoryCard
                  key={story.id}
                  story={story}
                  isActiveDrag={activeId === story.id}
                  isFocused={focusedId === story.id}
                  onFocus={() => onFocus?.(story.id)}
                  onPublish={onPublish}
                  onDelete={onDelete}
                />
              );
            }
            return (
              <StoryCard
                key={story.id}
                story={story}
                isFocused={focusedId === story.id}
                onFocus={() => onFocus?.(story.id)}
                onPublish={onPublish}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableStoryCard({
  story,
  isActiveDrag,
  isFocused,
  onFocus,
  onPublish,
  onDelete,
}: {
  story: Story;
  isActiveDrag: boolean;
  isFocused?: boolean;
  onFocus?: () => void;
  onPublish?: (s: Story) => void;
  onDelete?: (s: Story) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <StoryCard
        story={story}
        dragHandleProps={{
          attributes,
          listeners,
          setActivatorNodeRef,
          isDragging: isDragging || isActiveDrag,
        }}
        isFocused={isFocused}
        onFocus={onFocus}
        onPublish={onPublish}
        onDelete={onDelete}
      />
    </div>
  );
}

/** Pure helper — returns a re-sorted list reflecting an optimistic reorder. */
export function previewReorder(stories: Story[], movedId: string, newOrder: number): Story[] {
  const moved = stories.find((s) => s.id === movedId);
  if (!moved || moved.displayOrder === newOrder) return stories;
  const oldOrder = moved.displayOrder;
  return stories.map((s) => {
    if (s.id === movedId) return { ...s, displayOrder: newOrder };
    if (!s.isPublished) return s;
    if (oldOrder < newOrder) {
      if (s.displayOrder > oldOrder && s.displayOrder <= newOrder) {
        return { ...s, displayOrder: s.displayOrder - 1 };
      }
    } else {
      if (s.displayOrder >= newOrder && s.displayOrder < oldOrder) {
        return { ...s, displayOrder: s.displayOrder + 1 };
      }
    }
    return s;
  });
}
