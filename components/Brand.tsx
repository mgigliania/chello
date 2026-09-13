export function Brand() {
  return (
    <div className="flex items-center gap-2" aria-label="Pancho">
      <span
        className="size-[17px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, #FFE7D2 0%, #B48CF5 45%, #6E4FE0 100%)",
        }}
      />
      <span className="text-[30px] font-bold tracking-[-0.055em] leading-none text-ink">
        pancho
      </span>
    </div>
  );
}
