"use client";

const OPTIONS = [
  { id: "all", label: "All" },
  { id: "college", label: "College" },
  { id: "personal", label: "Personal" },
];

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="inline-flex gap-1.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            value === opt.id
              ? opt.id === "college"
                ? "border-college bg-college-soft text-college"
                : opt.id === "personal"
                ? "border-personal bg-personal-soft text-personal"
                : "border-ink bg-ink text-paper"
              : "border-line text-inkfaint hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
