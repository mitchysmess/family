import type { Profile } from "@/types/task";

type UserAvatarProps = {
  profile?: Profile;
  size?: "sm" | "md";
};

export function UserAvatar({ profile, size = "md" }: UserAvatarProps) {
  const dimensions = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  const initials = getInitials(profile?.fullName ?? "?");

  if (profile?.avatarUrl) {
    return (
      <span
        aria-hidden="true"
        className={`${dimensions} flex shrink-0 items-center justify-center rounded-full border-2 bg-cover bg-center`}
        style={{
          backgroundImage: `url(${profile.avatarUrl})`,
          borderColor: profile.profileColor,
        }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${dimensions} flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-1 ring-neutral-200`}
      style={{ backgroundColor: profile?.profileColor ?? "#244f45" }}
    >
      {initials}
    </span>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
