"use client";

import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";

const shots = [
  {
    src: "/cats-showcase/cat-1.jpeg",
    caption: "Shot #1",
    className: "absolute top-16 left-[22%] rotate-[-6deg]",
  },
  {
    src: "/cats-showcase/cat-2.jpeg",
    caption: "Shot #2",
    className: "absolute top-6 left-[38%] rotate-[3deg]",
  },
  {
    src: "/cats-showcase/cat-3.jpeg",
    caption: "Shot #3",
    className: "absolute top-20 left-[54%] rotate-[-4deg]",
  },
];

const CatShowcaseSection = () => {
  return (
    <section className="w-full overflow-hidden pt-16 pb-4">
      <div className="max-w-5xl mx-auto px-6 mb-2">
        <p className="text-xs tracking-[0.1em] text-primary mb-2 font-semibold">
          Silly Shots
        </p>
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
          Your moments, made tangible.
        </h2>
      </div>
      <DraggableCardContainer className="relative min-h-[600px] w-full overflow-clip [perspective:3000px]">
        {shots.map((shot) => (
          <DraggableCardBody key={shot.caption} className={shot.className}>
            <img
              src={shot.src}
              alt={shot.caption}
              className="pointer-events-none relative z-10 h-64 w-full object-cover"
            />
            <p className="mt-4 text-center text-sm font-mono tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
              {shot.caption}
            </p>
          </DraggableCardBody>
        ))}
      </DraggableCardContainer>
    </section>
  );
};

export default CatShowcaseSection;
