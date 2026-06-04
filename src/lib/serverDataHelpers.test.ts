import { describe, expect, it } from "vitest";
import {
  buildTaskInsertPayload,
  createInternalProfileEmail,
  fillRequiredTaskRelations,
  getDatabaseErrorMessage,
  isRequiredTaskRelationError,
  mapProfile,
  mapTask,
  unassignedProfileEmail,
} from "./serverDataHelpers";

describe("serverDataHelpers", () => {
  it("maakt een taak zonder toegewezen gezinslid aan met assigned_to null", () => {
    const payload = buildTaskInsertPayload({
      title: "  Keukentafel opruimen  ",
      description: "  ",
      taskDate: "2026-05-26",
      assignedTo: "",
      repeat: "none",
      repeatUntil: "",
    });

    expect(payload).toEqual([
      {
        id: expect.any(String),
        title: "Keukentafel opruimen",
        description: null,
        task_date: "2026-05-26",
        assigned_to: null,
        created_by: null,
        priority: "normal",
        status: "open",
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
    ]);
  });

  it("maakt herhaalde werkdagen alleen voor maandag tot en met vrijdag", () => {
    const payload = buildTaskInsertPayload({
      title: "Boodschappenlijst maken",
      description: "",
      taskDate: "2026-05-22",
      assignedTo: "profile-1",
      repeat: "weekdays",
      repeatUntil: "2026-05-26",
    });

    expect(payload.map((task) => task.task_date)).toEqual([
      "2026-05-22",
      "2026-05-25",
      "2026-05-26",
    ]);
  });

  it("toont oude profielen zonder profile_color met een veilige standaardkleur", () => {
    const profile = mapProfile({
      id: "profile-1",
      full_name: "Noor",
      email: "noor@familie.local",
      role: "member",
      avatar_url: null,
      created_at: "2026-05-26T10:00:00Z",
    });

    expect(profile.profileColor).toBe("#347468");
    expect(profile.fullName).toBe("Noor");
  });

  it("mapt taken zonder assigned_to naar een lege assignedTo string voor de UI", () => {
    const task = mapTask({
      id: "task-1",
      title: "Prijskaartjes",
      description: null,
      task_date: "2026-05-26",
      assigned_to: null,
      created_by: null,
      status: "open",
      created_at: "2026-05-26T10:00:00Z",
      updated_at: "2026-05-26T10:00:00Z",
    });

    expect(task.assignedTo).toBe("");
    expect(task.description).toBeUndefined();
  });

  it("maakt interne profielmail zonder zichtbare invoer van e-mail", () => {
    expect(createInternalProfileEmail("Noor de Vries", 123)).toBe(
      "noor-de-vries-123@familie.local",
    );
  });

  it("geeft actiegerichte databasefouten terug voor bekende schema-problemen", () => {
    expect(
      getDatabaseErrorMessage("Taak opslaan is mislukt", {
        message: 'null value in column "assigned_to" violates not-null constraint',
      }),
    ).toContain("assigned_to");
  });

  it("herkent oude verplichte taakrelaties en kan die vullen met fallback profiel", () => {
    expect(
      isRequiredTaskRelationError({
        message: 'null value in column "created_by" violates not-null constraint',
      }),
    ).toBe(true);

    const payload = buildTaskInsertPayload({
      title: "Dagstart",
      description: "",
      taskDate: "2026-05-26",
      assignedTo: "",
      repeat: "none",
      repeatUntil: "",
    });

    expect(fillRequiredTaskRelations(payload, "fallback-profile")).toEqual([
      {
        id: expect.any(String),
        title: "Dagstart",
        description: null,
        task_date: "2026-05-26",
        assigned_to: "fallback-profile",
        created_by: "fallback-profile",
        priority: "normal",
        status: "open",
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
    ]);
  });

  it("heeft een vaste interne mail voor het verborgen niet-toegewezen profiel", () => {
    expect(unassignedProfileEmail).toBe("__unassigned__@familie.local");
  });
});
