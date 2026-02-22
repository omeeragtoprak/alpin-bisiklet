export default function ProductDetailLoading() {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
      {/* Spinning bicycle wheel */}
      <div className="relative w-36 h-36">
        {/* Static spokes SVG */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full text-muted-foreground/25"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="3.5" fill="none" />
          <circle cx="50" cy="50" r="6" stroke="currentColor" strokeWidth="3" fill="none" />
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 22.5 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={50 + 6 * Math.cos(angle)}
                y1={50 + 6 * Math.sin(angle)}
                x2={50 + 42 * Math.cos(angle)}
                y2={50 + 42 * Math.sin(angle)}
                stroke="currentColor"
                strokeWidth="1.2"
              />
            );
          })}
        </svg>
        {/* Spinning accent ring */}
        <div
          className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-primary border-r-primary/40"
          style={{ animation: "spin 0.9s linear infinite" }}
        />
      </div>

      {/* Brand text */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">
          Alpin Bisiklet
        </p>
        <p className="text-xs text-muted-foreground animate-pulse">
          Ürün yükleniyor...
        </p>
      </div>
    </div>
  );
}
