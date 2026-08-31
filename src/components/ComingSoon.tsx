export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <h1 className="mb-8 text-[28px] font-medium">{title}</h1>
      <div className="rounded-2xl border border-dashed border-line bg-white p-14 text-center">
        <p className="mb-1.5 text-[15px] font-medium">Coming soon</p>
        <p className="mx-auto max-w-md text-[13.5px] text-ink-soft">{description}</p>
      </div>
    </div>
  );
}
