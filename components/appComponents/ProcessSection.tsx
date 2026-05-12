const steps = [
  ["01", "Start a session", "Open the booth and get ready."],
  ["02", "Capture the set", "Take a clean series of photos."],
  ["03", "Save the memory", "Keep the final result ready to share."],
];

const ProcessSection = () => {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-14 sm:py-16">
      <div className="border-t border-border">
        {steps.map(([number, title, description]) => (
          <div
            key={number}
            className="grid gap-4 border-b border-border py-6 sm:grid-cols-[5rem_1fr_1.2fr] sm:items-center"
          >
            <span className="font-mono text-sm text-muted-foreground">
              {number}
            </span>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              {title}
            </h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground sm:justify-self-end">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProcessSection;
