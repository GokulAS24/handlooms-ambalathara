import Image from "next/image";

const MARK_RATIO = 592 / 498;
const FULL_RATIO = 1104 / 657;
const LOGO_RED = "#b81f22";

export function LogoMark({
  className,
  size = 40,
  src = "/images/logo-mark.png",
}: {
  className?: string;
  size?: number;
  src?: string;
}) {
  return (
    <Image
      src={src}
      alt="Ambalathara Handlooms"
      width={Math.round(size * MARK_RATIO)}
      height={size}
      className={className}
    />
  );
}

export function LogoFull({
  className,
  height = 64,
  src = "/images/logo-full.png",
}: {
  className?: string;
  height?: number;
  src?: string;
}) {
  return (
    <Image
      src={src}
      alt="Ambalathara Handlooms"
      width={Math.round(height * FULL_RATIO)}
      height={height}
      className={className}
    />
  );
}

export default function Logo({
  className,
  markClassName = "h-10 w-auto",
  markSrc,
  showWordmark = true,
  wordmarkClassName = "text-lg",
  label = "Ambalathara Handlooms",
}: {
  className?: string;
  markClassName?: string;
  markSrc?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  label?: string;
}) {
  const [firstWord, ...rest] = label.split(" ");
  const secondLine = rest.join(" ");

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className={markClassName} src={markSrc} />
      {showWordmark && (
        <span
          className={`flex flex-col font-serif font-semibold leading-[1.05] tracking-wide ${wordmarkClassName}`}
          style={{ color: LOGO_RED }}
        >
          <span>{firstWord}</span>
          {secondLine && <span>{secondLine}</span>}
        </span>
      )}
    </span>
  );
}
