import type { NewProfileForm, Profile } from "@/types/task";

export async function getProfiles(): Promise<Profile[]> {
  const response = await fetch("/api/profiles");
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Profielen laden is mislukt.");
  }

  return body.profiles;
}

export async function createProfile(input: NewProfileForm): Promise<Profile> {
  const response = await fetch("/api/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Gezinslid opslaan is mislukt.");
  }

  return body.profile;
}

export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/profile-image", {
    method: "POST",
    body: formData,
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Afbeelding uploaden is mislukt.");
  }

  return body.avatarUrl;
}

export async function deleteProfile(profileId: string): Promise<void> {
  const response = await fetch(`/api/profiles/${profileId}`, {
    method: "DELETE",
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Gezinslid verwijderen is mislukt.");
  }
}
