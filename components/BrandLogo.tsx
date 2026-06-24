import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <Image
          src="/brand/kurzwarten-icon.png"
          width={32}
          height={32}
          alt=""
          className="h-8 w-8 shrink-0"
          priority
        />
        <span className="font-bold text-slate-950">KurzWarten</span>
      </span>
    );
  }

  return (
    <Image
      src="/brand/kurzwarten-logo.png"
      width={1243}
      height={356}
      alt="KurzWarten"
      className={`h-auto w-[178px] sm:w-[210px] ${className}`}
      priority
    />
  );
}
