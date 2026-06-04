import { expect, test, type Page } from "@playwright/test";

const profiles = [
  {
    id: "papa",
    fullName: "Papa",
    email: "papa@familie.local",
    role: "member",
    avatarUrl: "",
    profileColor: "#347468",
  },
  {
    id: "noor",
    fullName: "Noor",
    email: "noor@familie.local",
    role: "member",
    avatarUrl: "",
    profileColor: "#4f7f8f",
  },
];

const tasks = [
  {
    id: "task-groceries",
    title: "Boodschappen bestellen",
    description: "Weeklijst nalopen",
    taskDate: "2026-05-29",
    assignedTo: "papa",
    createdBy: "",
    status: "open",
    priority: "normal",
    createdAt: "2020-05-29T08:00:00.000Z",
    updatedAt: "2020-05-29T08:00:00.000Z",
  },
  {
    id: "task-cleaning",
    title: "Badkamer opfrissen",
    description: "Spiegel, wastafel en vloer",
    taskDate: "2026-05-29",
    assignedTo: "",
    createdBy: "",
    status: "open",
    priority: "high",
    createdAt: "2026-05-29T07:00:00.000Z",
    updatedAt: "2026-05-29T07:00:00.000Z",
  },
  {
    id: "task-window",
    title: "Planten water gegeven",
    description: "Afgeronde taak moet vindbaar blijven",
    taskDate: "2026-05-29",
    assignedTo: "noor",
    createdBy: "",
    status: "done",
    priority: "normal",
    createdAt: "2026-05-29T06:00:00.000Z",
    updatedAt: "2026-05-29T06:30:00.000Z",
  },
  {
    id: "task-register",
    title: "Sporttas ingepakt",
    description: "Andere afgeronde taak",
    taskDate: "2026-05-29",
    assignedTo: "papa",
    createdBy: "",
    status: "done",
    priority: "normal",
    createdAt: "2026-05-29T05:00:00.000Z",
    updatedAt: "2026-05-29T05:30:00.000Z",
  },
];

test("kan inloggen en een taak aanmaken", async ({ page }) => {
  await mockApi(page, { authenticated: false });
  await page.goto("/");

  await page.getByLabel("Wachtwoord").fill("2261");
  await page.getByRole("button", { name: "Inloggen" }).click();

  await page.getByRole("button", { name: "Nieuwe taak" }).click();
  await page.getByLabel("Titel").fill("Broodtrommels klaarzetten");
  await page.getByLabel("Omschrijving").fill("Fruit, drinken en lunch erin");
  await page.getByLabel("Toegewezen persoon").selectOption("noor");
  await page.getByRole("button", { name: "Opslaan" }).click();

  await expect(page.getByRole("heading", { name: "Broodtrommels klaarzetten" })).toBeVisible();
  await expect(page.getByText("Fruit, drinken en lunch erin")).toBeVisible();
});

test("kan het dashboard handmatig verversen", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/");

  await page.getByRole("button", { name: "Dashboard verversen" }).click();

  await expect(page.getByRole("heading", { name: "Gezinsbord" })).toBeVisible();
});

test("kan taken zoeken in het taakoverzicht", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/overzicht");

  await expect(page.getByRole("heading", { name: "Planten water gegeven" })).toHaveCount(0);

  await page.getByLabel("Zoeken").fill("boodschappen");

  await expect(page.getByRole("heading", { name: "Boodschappen bestellen" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Badkamer opfrissen" })).toHaveCount(0);

  await page.getByLabel("Zoeken").fill("planten");

  await expect(page.getByRole("heading", { name: "Planten water gegeven" })).toBeVisible();
});

test("kan het taakoverzicht handmatig verversen", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/overzicht");

  await page.getByRole("button", { name: "Taakoverzicht verversen" }).click();

  await expect(page.getByRole("heading", { name: "Boodschappen bestellen" })).toBeVisible();
});

test("kan een taak aanmaken vanuit het taakoverzicht", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/overzicht");

  await page.getByRole("button", { name: "Nieuwe taak" }).click();
  await page.getByLabel("Titel").fill("Broodtrommels klaarzetten");
  await page.getByLabel("Omschrijving").fill("Fruit, drinken en lunch erin");
  await page.getByLabel("Toegewezen persoon").selectOption("noor");
  await page.getByRole("button", { name: "Opslaan" }).click();

  await expect(page.getByRole("heading", { name: "Broodtrommels klaarzetten" })).toBeVisible();
});

test("toont een melding bij open taken die lang wachten", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/overzicht");

  await expect(
    page.getByText(/Deze taak wacht al \d+ dagen/).first(),
  ).toBeVisible();
});

test("herstelt alle afgeronde taken na zoeken wissen", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/overzicht");

  await page.getByRole("button", { name: /Afgeronde taken/ }).click();
  await expect(page.getByRole("heading", { name: "Planten water gegeven" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sporttas ingepakt" })).toBeVisible();

  await page.getByLabel("Zoeken").fill("planten");
  await expect(page.getByRole("heading", { name: "Planten water gegeven" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sporttas ingepakt" })).toHaveCount(0);

  await page.getByLabel("Zoeken").fill("");
  await expect(page.getByRole("heading", { name: "Planten water gegeven" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sporttas ingepakt" })).toBeVisible();
});

test("kan een taak afvinken in het taakoverzicht", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/overzicht");

  await page.getByRole("button", { name: "Taak afvinken" }).first().click();

  await page.getByRole("button", { name: /Afgeronde taken/ }).click();

  await expect(
    page.getByRole("button", { name: "Zet taak weer open" }).first(),
  ).toBeVisible();
});

test("gezin scherm blijft passend op mobiele breedtes", async ({ page }) => {
  await mockApi(page, { authenticated: true });

  for (const viewport of [
    { width: 360, height: 740 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/team");

    await expect(page.getByRole("heading", { name: "Profielen" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Toevoegen" })).toHaveCount(0);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(hasHorizontalOverflow).toBe(false);
  }
});

test("opent gezinslid toevoegen pas via de plusknop", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/team");

  await page.getByRole("button", { name: "Gezinslid toevoegen" }).click();

  await expect(page.getByRole("heading", { name: "Toevoegen" })).toBeVisible();
});

async function mockApi(
  page: Page,
  options: { authenticated: boolean },
) {
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      json: { authenticated: options.authenticated },
    });
  });

  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      json: { ok: true },
    });
  });

  await page.route("**/api/profiles", async (route) => {
    await route.fulfill({
      json: { profiles },
    });
  });

  await page.route("**/api/tasks**", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        json: {
          tasks: [
            {
              ...tasks[0],
              id: "task-new",
              title: "Broodtrommels klaarzetten",
              description: "Fruit, drinken en lunch erin",
              assignedTo: "noor",
              createdAt: "2026-05-29T09:00:00.000Z",
              updatedAt: "2026-05-29T09:00:00.000Z",
            },
          ],
        },
      });
      return;
    }

    const url = new URL(route.request().url());
    const status = url.searchParams.get("status");
    const query = url.searchParams.get("query")?.toLowerCase() ?? "";
    let responseTasks = [...tasks];

    if (query) {
      responseTasks = responseTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description ?? "").toLowerCase().includes(query),
      );
    } else if (status === "open" || status === "done") {
      responseTasks = responseTasks.filter((task) => task.status === status);
    }

    await route.fulfill({
      json: { tasks: responseTasks },
    });
  });

  await page.route("**/api/tasks/*/status", async (route) => {
    await route.fulfill({
      json: {
        task: {
          ...tasks[0],
          status: "done",
          updatedAt: "2026-05-29T10:00:00.000Z",
        },
      },
    });
  });
}
