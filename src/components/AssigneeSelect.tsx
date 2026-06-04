import type { Profile } from "@/types/task";
import { UserAvatar } from "@/components/UserAvatar";

type AssigneeSelectProps = {
  value: string;
  options: Profile[];
  error?: string;
  onChange: (value: string) => void;
};

export function AssigneeSelect({
  value,
  options,
  error,
  onChange,
}: AssigneeSelectProps) {
  const selectedProfile = options.find((profile) => profile.id === value);

  return (
    <label className="grid gap-2 text-sm font-medium text-neutral-700">
      Toegewezen persoon
      {selectedProfile ? (
        <div className="flex items-center gap-2 rounded-2xl border border-[#d7e3ce] bg-[#f4fbf3] px-3 py-2">
          <UserAvatar profile={selectedProfile} />
          <span className="font-medium text-neutral-900">
            {selectedProfile.fullName}
          </span>
        </div>
      ) : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`h-11 rounded-full border bg-white px-4 text-sm outline-none transition focus:ring-2 ${
          error
            ? "border-red-500 focus:border-red-600 focus:ring-red-100"
            : "border-[#d7e3ce] focus:border-[#347468] focus:ring-[#347468]/15"
        }`}
      >
        <option value="">Niet toegewezen</option>
        {options.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.fullName}
          </option>
        ))}
      </select>
      {error ? <span className="text-sm text-red-700">{error}</span> : null}
    </label>
  );
}
