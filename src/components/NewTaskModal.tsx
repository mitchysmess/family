import type { FormEvent } from "react";
import type {
  NewTaskForm,
  Profile,
  TaskFormErrors,
} from "@/types/task";
import { AssigneeSelect } from "@/components/AssigneeSelect";
import { Button } from "@/components/ui/button";

type NewTaskModalProps = {
  form: NewTaskForm;
  errors: TaskFormErrors;
  profiles: Profile[];
  isSaving: boolean;
  onChange: (field: keyof NewTaskForm, value: string) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function NewTaskModal({
  form,
  errors,
  profiles,
  isSaving,
  onChange,
  onCancel,
  onSubmit,
}: NewTaskModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-task-heading"
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-neutral-950/40 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
    >
      <form
        onSubmit={onSubmit}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="shrink-0 border-b border-[#d7e3ce] px-5 py-4 sm:px-6">
          <h2
            id="new-task-heading"
            className="text-xl font-semibold text-neutral-950"
          >
            Nieuwe taak
          </h2>
        </div>

        <div className="grid gap-4 overflow-y-auto px-5 py-5 sm:px-6">
          <label className="grid gap-2 text-sm font-medium text-neutral-700">
            Titel
            <input
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "task-title-error" : undefined}
              className={`h-11 rounded-full border px-4 text-sm outline-none transition focus:ring-2 ${
                errors.title
                  ? "border-red-500 focus:border-red-600 focus:ring-red-100"
                  : "border-[#d7e3ce] focus:border-[#347468] focus:ring-[#347468]/15"
              }`}
            />
            {errors.title ? (
              <span id="task-title-error" className="text-sm text-red-700">
                {errors.title}
              </span>
            ) : null}
          </label>

          <label className="grid gap-2 text-sm font-medium text-neutral-700">
            Omschrijving
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              className="resize-none rounded-2xl border border-[#d7e3ce] px-3 py-2 text-sm outline-none transition focus:border-[#347468] focus:ring-2 focus:ring-[#347468]/15"
            />
          </label>

          <AssigneeSelect
            value={form.assignedTo}
            options={profiles}
            error={errors.assignedTo}
            onChange={(value) => onChange("assignedTo", value)}
          />
        </div>

        <div className="shrink-0 flex flex-col-reverse gap-3 border-t border-[#d7e3ce] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button variant="outline" onClick={onCancel}>
            Annuleren
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
