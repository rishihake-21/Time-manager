"use client";

const OPTIONS = [
  { id: "all", label: "All" },
  { id: "college", label: "College" },
  { id: "study", label: "Study" },
  { id: "project", label: "Project" },
  { id: "personal", label: "Personal" },
  { id: "exercise", label: "Exercise" },
  { id: "other", label: "Other" },
];

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="inline-flex gap-1.5 flex-wrap">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            value === opt.id
              ? `border-${opt.id} bg-${opt.id}-soft text-${opt.id}`
              : "border-line text-inkfaint hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}