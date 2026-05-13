"use client";

import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";

const shots = [
  {
    src: "/cats-showcase/cat-1.jpeg",
    caption: "Shot #1",
    className: "absolute top-8 left-[4%] rotate-[-6deg] sm:top-16 sm:left-[22%]",
  },
  {
    src: "/cats-showcase/cat-2.jpeg",
    caption: "Shot #2",
    className: "absolute top-28 left-[34%] rotate-[3deg] sm:top-6 sm:left-[38%]",
  },
  {
    src: "/cats-showcase/cat-3.jpeg",
    caption: "Shot #3",
    className: "absolute top-52 left-[12%] rotate-[-4deg] sm:top-20 sm:left-[54%]",
  },
];

const CatShowcaseSection = () => {
  return (
    <section className="w-full overflow-hidden pt-12 pb-2 sm:pt-16 sm:pb-4">
      <div className="max-w-5xl mx-auto px-6 mb-2">
        <p className="text-xs tracking-[0.1em] text-primary mb-2 font-semibold">
          Silly Shots
        </p>
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
          Your moments, made tangible.
        </h2>
      </div>
      <DraggableCardContainer className="relative min-h-[520px] w-full overflow-clip [perspective:3000px] sm:min-h-[600px]">
        {shots.map((shot) => (
          <DraggableCardBody key={shot.caption} className={shot.className}>
            <img
              src={shot.src}
              alt={shot.caption}
              className="pointer-events-none relative z-10 h-44 w-full object-cover sm:h-64"
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
