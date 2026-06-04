"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Trash2, UploadCloud, UsersRound } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { LoginForm } from "@/components/LoginForm";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  createProfile,
  deleteProfile,
  getProfiles,
  uploadProfileImage,
} from "@/lib/profiles";
import type { NewProfileForm, Profile, ProfileFormErrors } from "@/types/task";

const profileColors = [
  "#244f45",
  "#347468",
  "#4c8a7d",
  "#6da48e",
  "#e66d35",
  "#f1a04f",
  "#c5a044",
  "#7f8f52",
  "#b0be62",
  "#5f8f70",
  "#4f7f8f",
  "#5b9ca8",
  "#3d6f9f",
  "#7b6aa8",
  "#9a78b8",
  "#c06aa1",
  "#5e6656",
  "#8c735f",
  "#555f6d",
  "#111827",
];

const emptyProfileForm: NewProfileForm = {
  fullName: "",
  avatarUrl: "",
  profileColor: profileColors[0],
};

export function TeamPageShell() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(
    null,
  );
  const [profileForm, setProfileForm] =
    useState<NewProfileForm>(emptyProfileForm);
  const [profileFormErrors, setProfileFormErrors] =
    useState<ProfileFormErrors>({});
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    async function loadPage() {
      try {
        const response = await fetch("/api/auth/session");
        const body = await response.json();
        const authenticated = Boolean(body.authenticated);

        setIsAuthenticated(authenticated);

        if (authenticated) {
          setProfiles(await getProfiles());
        }
      } catch (pageError) {
        setError(getErrorMessage(pageError));
      } finally {
        setIsLoading(false);
      }
    }

    loadPage();
  }, []);

  async function signIn(password: string) {
    setIsSubmitting(true);
    setError(undefined);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const body = await response.json();

      if (!response.ok) {
        setError(body.error ?? "Inloggen is mislukt.");
        return;
      }

      setIsAuthenticated(true);
      setProfiles(await getProfiles());
    } catch (signInError) {
      setError(getErrorMessage(signInError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signOut() {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateProfileForm(profileForm);

    if (Object.keys(nextErrors).length > 0) {
      setProfileFormErrors(nextErrors);
      return;
    }

    setIsSavingProfile(true);
    setError(undefined);

    try {
      const newProfile = await createProfile({
        ...profileForm,
        fullName: profileForm.fullName.trim(),
        avatarUrl: profileForm.avatarUrl.trim(),
      });

      setProfiles((currentProfiles) =>
        [...currentProfiles, newProfile].sort((first, second) =>
          first.fullName.localeCompare(second.fullName),
        ),
      );
      setProfileForm(emptyProfileForm);
      setProfileFormErrors({});
      setIsProfileModalOpen(false);
    } catch (profileError) {
      setError(getErrorMessage(profileError));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploadingImage(true);
    setError(undefined);
    setProfileFormErrors((currentErrors) => ({
      ...currentErrors,
      avatarUrl: undefined,
    }));

    try {
      const avatarUrl = await uploadProfileImage(file);
      setProfileForm((currentForm) => ({ ...currentForm, avatarUrl }));
    } catch (uploadError) {
      setProfileFormErrors((currentErrors) => ({
        ...currentErrors,
        avatarUrl: getErrorMessage(uploadError),
      }));
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  async function removeProfile(profile: Profile) {
    const confirmed = window.confirm(
      `Weet je zeker dat je ${profile.fullName} uit het gezinsoverzicht wilt verwijderen? Bestaande taken blijven bestaan en worden niet toegewezen.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingProfileId(profile.id);
    setError(undefined);

    try {
      await deleteProfile(profile.id);
      setProfiles((currentProfiles) =>
        currentProfiles.filter(
          (currentProfile) => currentProfile.id !== profile.id,
        ),
      );
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setDeletingProfileId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7f1] px-6">
        <div className="rounded-lg border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600 shadow-sm">
          Gezin laden...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginForm error={error} isSubmitting={isSubmitting} onSubmit={signIn} />
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f1]">
      <AppHeader
        currentUser={{ name: "Familie", email: "Gedeelde gezinslogin" }}
        onSignOut={signOut}
      />
      <section className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
          <Link
            href="/"
            aria-label="Terug naar dashboard"
            title="Terug naar dashboard"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#b9cdb7] bg-white text-[#347468] shadow-sm transition hover:border-[#e66d35] hover:bg-[#fff2b8]/35"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setProfileForm(emptyProfileForm);
              setProfileFormErrors({});
              setIsProfileModalOpen(true);
            }}
            aria-label="Gezinslid toevoegen"
            title="Gezinslid toevoegen"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#244f45] text-[#fff2b8] shadow-[0_10px_24px_rgba(36,79,69,0.2)] transition hover:-translate-y-0.5 hover:bg-[#347468]"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid gap-4"
        >
          <Card className="overflow-hidden rounded-[1.6rem] sm:rounded-3xl">
            <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#347468]">
              Gezin
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#183b35] sm:text-3xl">
              Profielen
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#5e6656]">
              Iedereen die taken, klusjes of afspraken kan krijgen.
            </p>

            {error ? (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <ul className="mt-5 grid gap-3 sm:mt-6">
              {profiles.map((profile) => (
                <li
                  key={profile.id}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#d7e3ce] bg-[#fbfaf8] p-3 sm:p-4"
                  style={{ borderLeft: `5px solid ${profile.profileColor}` }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar profile={profile} />
                    <p className="min-w-0 truncate font-semibold text-[#183b35]">
                      {profile.fullName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProfile(profile)}
                    disabled={deletingProfileId === profile.id}
                    aria-label={`${profile.fullName} verwijderen`}
                    title={`${profile.fullName} verwijderen`}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-neutral-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            {profiles.length === 0 && !error ? (
              <div className="mt-5 rounded-2xl border border-[#d7e3ce] bg-[#fff2b8]/30 p-4 sm:mt-6 sm:p-5">
                <p className="font-semibold text-[#244f45]">
                  Nog geen gezinsleden toegevoegd.
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-[#347468]">
                  Voeg eerst iemand toe. Daarna kun je taken direct eerlijk verdelen.
                </p>
              </div>
            ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </section>
      {isProfileModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-heading"
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-neutral-950/40 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
        >
          <form
            onSubmit={saveProfile}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="shrink-0 border-b border-[#d7e3ce] px-5 py-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#347468]">
                <UsersRound className="h-4 w-4" />
                Gezinslid
              </p>
              <h1
                id="profile-modal-heading"
                className="mt-2 text-2xl font-semibold text-[#183b35]"
              >
                Toevoegen
              </h1>
            </div>

            <div className="grid gap-4 overflow-y-auto px-5 py-5">
              <label className="grid gap-2 text-sm font-semibold text-[#183b35]">
                Naam
                <input
                  value={profileForm.fullName}
                  onChange={(event) =>
                    updateProfileForm("fullName", event.target.value)
                  }
                  aria-invalid={Boolean(profileFormErrors.fullName)}
                  className={`h-11 rounded-md border px-3 text-sm outline-none transition focus:ring-2 ${
                    profileFormErrors.fullName
                      ? "border-red-500 focus:border-red-600 focus:ring-red-100"
                      : "border-neutral-300 focus:border-[#347468] focus:ring-[#347468]/15"
                  }`}
                />
                {profileFormErrors.fullName ? (
                  <span className="text-sm text-red-700">
                    {profileFormErrors.fullName}
                  </span>
                ) : null}
              </label>

              <div className="grid gap-2 text-sm font-semibold text-[#183b35]">
                <span>Foto</span>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={uploadImage}
                  aria-invalid={Boolean(profileFormErrors.avatarUrl)}
                  className="sr-only"
                />
                <label
                  htmlFor="profile-image-upload"
                  className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition ${
                    profileFormErrors.avatarUrl
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-[#b9cdb7] bg-[#fff2b8]/25 text-[#347468] hover:border-[#e66d35] hover:bg-white"
                  }`}
                >
                  <UploadCloud className="h-4 w-4 shrink-0" />
                  {profileForm.avatarUrl ? "Andere foto kiezen" : "Foto kiezen"}
                </label>
                {isUploadingImage ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-[#5e6656]">
                    <UploadCloud className="h-4 w-4" />
                    Afbeelding uploaden...
                  </span>
                ) : null}
                {profileFormErrors.avatarUrl ? (
                  <span className="text-sm text-red-700">
                    {profileFormErrors.avatarUrl}
                  </span>
                ) : null}
              </div>

              <div className="grid gap-2 text-sm font-semibold text-[#183b35]">
                Profielkleur
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-[#d7e3ce] bg-[#f4fbf3] px-3 py-2">
                    <span
                      className="h-8 w-8 rounded-full border-2 border-white shadow-sm ring-1 ring-neutral-200"
                      style={{ backgroundColor: profileForm.profileColor }}
                    />
                    <span className="text-sm font-semibold text-neutral-900">
                      {profileForm.profileColor.toUpperCase()}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={profileForm.profileColor}
                    onChange={(event) =>
                      updateProfileForm("profileColor", event.target.value)
                    }
                    aria-label="Kies vrije profielkleur"
                    className="h-12 w-14 cursor-pointer rounded-2xl border border-[#d7e3ce] bg-white p-1"
                  />
                </div>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  {profileColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Kies kleur ${color}`}
                      onClick={() => updateProfileForm("profileColor", color)}
                      className={`h-8 w-8 shrink-0 rounded-full border-2 shadow-sm transition hover:scale-110 ${
                        profileForm.profileColor === color
                          ? "border-neutral-950"
                          : "border-white"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#d7e3ce] bg-[#fbfaf8] p-3">
                <UserAvatar
                  profile={{
                    id: "preview",
                    fullName: profileForm.fullName,
                    email: "",
                    role: "member",
                    avatarUrl: profileForm.avatarUrl,
                    profileColor: profileForm.profileColor,
                  }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#183b35]">
                    {profileForm.fullName || "Voorbeeld gezinslid"}
                  </p>
                  <p className="text-xs font-medium text-[#7d8b38]">
                    {profileForm.avatarUrl ? "Foto toegevoegd" : "Geen foto"}
                  </p>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col-reverse gap-3 border-t border-[#d7e3ce] bg-white px-5 py-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setProfileFormErrors({});
                }}
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                disabled={isSavingProfile || isUploadingImage}
              >
                {isSavingProfile ? "Opslaan..." : "Opslaan"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );

  function updateProfileForm<Field extends keyof NewProfileForm>(
    field: Field,
    value: NewProfileForm[Field],
  ) {
    setProfileForm((currentForm) => ({ ...currentForm, [field]: value }));
    setProfileFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

function validateProfileForm(form: NewProfileForm) {
  const errors: ProfileFormErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Vul de naam van het gezinslid in.";
  }

  if (form.avatarUrl.trim() && !isValidUrl(form.avatarUrl.trim())) {
    errors.avatarUrl = "Gebruik een geldige foto.";
  }

  return errors;
}

function isValidUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
  } catch {
    return false;
  }
}
