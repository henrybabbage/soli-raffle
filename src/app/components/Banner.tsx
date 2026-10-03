interface BannerProps {
  text?: string | null;
}

export default function Banner({ text }: BannerProps) {
  if (!text?.trim()) return null;

  return (
    <div className="w-full bg-accent text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
        <p className="text-center text-sm [font-family:system-ui,sans-serif]">
          {text}
        </p>
      </div>
    </div>
  );
}
