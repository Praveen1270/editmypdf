export function MakeItLastBadge() {
  return (
    <a
      href="https://www.makeitla.st/"
      title="Featured on MakeItLast"
      className="inline-block transition-opacity hover:opacity-85"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://www.makeitla.st/badge/makeitlast-badge-dark.svg?v=3"
        alt="Featured on MakeItLast"
        width={252}
        height={76}
        className="h-[36px] w-auto"
      />
    </a>
  );
}
