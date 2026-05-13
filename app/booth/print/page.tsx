import PrintDesigner, {
  type PrintLayoutId,
} from "@/components/appComponents/PrintDesigner";

const VALID_LAYOUTS = new Set<PrintLayoutId>([
  "strip-vertical",
  "strip-horizontal",
  "grid-mixed",
  "polaroid",
  "duo",
]);

const PHOTOS_PER_LAYOUT: Record<PrintLayoutId, number> = {
  "strip-vertical": 4,
  "strip-horizontal": 4,
  "grid-mixed": 4,
  polaroid: 1,
  duo: 2,
};

function parseLayout(value: string | string[] | undefined) {
  const layout = Array.isArray(value) ? value[0] : value;
  return layout && VALID_LAYOUTS.has(layout as PrintLayoutId)
    ? (layout as PrintLayoutId)
    : "strip-vertical";
}

function parsePhotoIndices(value: string | string[] | undefined, limit: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed =
    raw
      ?.split(",")
      .map((item) => Number.parseInt(item, 10))
      .filter((item, index, list) => {
        return (
          Number.isInteger(item) &&
          item >= 0 &&
          item < 4 &&
          list.indexOf(item) === index
        );
      }) ?? [];

  const fallback = Array.from({ length: limit }, (_, index) => index);
  return (parsed.length > 0 ? parsed : fallback).slice(0, limit);
}

export default async function BoothPrintPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const layout = parseLayout(params.layout);
  const photoIndices = parsePhotoIndices(
    params.photos,
    PHOTOS_PER_LAYOUT[layout],
  );

  return (
    <PrintDesigner
      initialLayout={layout}
      initialPhotoIndices={photoIndices}
      generatedAt={new Date().toISOString()}
    />
  );
}
