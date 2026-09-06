interface BannerProps {
  text?: string | null;
}

export default function Banner({ text }: BannerProps) {
  if (!text?.trim()) return null;

  return (
    <div className="w-full bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
        <p className="text-center text-[0.65rem] sm:text-xs font-mono uppercase tracking-[0.2em]">
          {text}
        </p>
      </div>
    </div>
  );
}
