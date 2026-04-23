export default function SectionBadge({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm">
      {children}
    </div>
  );
}