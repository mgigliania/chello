"use client";

import { SearchIcon } from "@/components/Icons";

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange(value: string): void;
  placeholder: string;
}) {
  return (
    <label className="mt-4 flex items-center gap-3 rounded-full bg-raised px-5 py-3.5 shadow-[0_2px_12px_rgba(36,31,41,0.05)]">
      <span className="text-faint">
        <SearchIcon size={20} />
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[17px] outline-none placeholder:text-faint"
      />
    </label>
  );
}
