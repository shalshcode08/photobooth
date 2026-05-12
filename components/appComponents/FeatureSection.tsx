const features = [
  {
    title: "Clean capture",
    description: "A focused booth experience with just enough guidance.",
  },
  {
    title: "Flexible frames",
    description: "Room for layouts, overlays, and event-ready styles.",
  },
  {
    title: "Easy keepsakes",
    description: "A simple path from session to saved memory.",
  },
];

const FeatureSection = () => {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-14 sm:py-16">
      <div className="grid border-y border-border md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="border-border py-8 md:border-r md:px-8 md:last:border-r-0"
          >
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {feature.title}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
