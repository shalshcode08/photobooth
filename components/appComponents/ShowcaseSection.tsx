import HeroShaderFrame from "@/components/appComponents/HeroShaderFrame";

const ShowcaseSection = () => {
  return (
    <section className="relative isolate mx-auto w-full max-w-5xl px-6 py-14 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 right-6 -z-10 h-64 w-[min(28rem,70vw)] overflow-hidden opacity-50 blur-2xl"
      >
        <HeroShaderFrame />
      </div>

      <div className="grid items-end gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-medium text-primary">Preview space</p>
          <h2 className="mt-3 max-w-md font-heading text-3xl leading-tight font-semibold text-foreground sm:text-4xl">
            Designed to feel calm before the camera starts.
          </h2>
        </div>

        <div className="grid grid-cols-3 items-end gap-3 sm:gap-4">
          <div className="h-48 border border-border bg-muted/35 sm:h-56" />
          <div className="h-60 border border-border bg-muted/50 sm:h-72" />
          <div className="h-40 border border-border bg-muted/30 sm:h-48" />
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
