export function PrintClipDefs() {
  return (
    <svg className="absolute h-0 w-0" aria-hidden="true">
      <defs>
        <clipPath id="print-star-clip" clipPathUnits="objectBoundingBox">
          <path d="M .5 .02 L .62 .32 L .98 .32 L .69 .52 L .82 .90 L .5 .66 L .18 .90 L .31 .52 L .02 .32 L .38 .32 Z" />
        </clipPath>
        <clipPath id="print-heart-clip" clipPathUnits="objectBoundingBox">
          <path d="M .5 .96 C .36 .82 .06 .58 .04 .30 C .02 .10 .17 .01 .34 .01 C .43 .01 .49 .07 .5 .16 C .51 .07 .57 .01 .66 .01 C .83 .01 .98 .10 .96 .30 C .94 .58 .64 .82 .5 .96 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
