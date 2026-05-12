"use client";

import { Children, type ReactNode } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

const PageScrollMotion = ({ children }: { children: ReactNode }) => {
  const shouldReduceMotion = useReducedMotion();
  const sections = Children.toArray(children);

  return (
    <LazyMotion features={domAnimation} strict>
      {sections.map((child, index) => (
        <m.div
          key={index}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.16, margin: "0px 0px -72px" }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
            delay: index === 0 ? 0 : 0.04,
          }}
        >
          {child}
        </m.div>
      ))}
    </LazyMotion>
  );
};

export default PageScrollMotion;
