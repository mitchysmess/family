import type { Profile, Task } from "@/types/task";
import { TaskItem } from "@/components/TaskItem";
import { Button } from "@/components/ui/button";

type TaskListProps = {
  tasks: Task[];
  hasTasksForDate: boolean;
  isLoading: boolean;
  profiles: Profile[];
  onDeleteTask: (taskId: string) => void;
  onAssignTask: (taskId: string, profileId: string) => void;
  onUpdateTaskDescription: (taskId: string, description: string) => void;
  onToggleTaskPriority: (taskId: string) => void;
  onCreateTask: () => void;
  onClearFilter: () => void;
};

export function TaskList({
  tasks,
  hasTasksForDate,
  isLoading,
  profiles,
  onDeleteTask,
  onAssignTask,
  onUpdateTaskDescription,
  onToggleTaskPriority,
  onCreateTask,
  onClearFilter,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="px-5 py-12 text-center text-sm text-neutral-500 sm:px-6">
        Taken laden...
      </div>
    );
  }

  if (!hasTasksForDate) {
    return (
      <EmptyState
        title="Geen taken."
        description="Maak een nieuwe taak aan om de lijst te vullen."
        actionLabel="Nieuwe taak"
        onAction={onCreateTask}
      />
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="Geen taken binnen dit filter."
        description="Kies een ander filter of maak een nieuwe taak aan."
        actionLabel="Toon alle taken"
        onAction={onClearFilter}
      />
    );
  }

  return (
    <ul className="divide-y divide-neutral-200">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          assignee={profiles.find((profile) => profile.id === task.assignedTo)}
          profiles={profiles}
          isMine={false}
          onDelete={onDeleteTask}
          onAssign={onAssignTask}
          onUpdateDescription={onUpdateTaskDescription}
          onTogglePriority={onToggleTaskPriority}
        />
      ))}
    </ul>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="px-5 py-12 text-center sm:px-6">
      <p className="font-medium text-neutral-950">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
        {description}
      </p>
      <Button onClick={onAction} variant="secondary" className="mt-5">
        {actionLabel}
      </Button>
    </div>
  );
}
