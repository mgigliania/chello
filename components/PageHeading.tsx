export function PageHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mt-7">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
        {eyebrow}
      </p>
      <h1 className="mt-2.5 text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink">
        {title}
      </h1>
      {subtitle && <p className="mt-3 text-[17px] text-muted">{subtitle}</p>}
    </div>
  );
}
