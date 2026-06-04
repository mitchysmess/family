type DateSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DateSelector({ value, onChange }: DateSelectorProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-neutral-700">
      Datum
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-full border border-[#d7e3ce] bg-white px-4 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-[#347468] focus:ring-2 focus:ring-[#347468]/15"
      />
    </label>
  );
}
