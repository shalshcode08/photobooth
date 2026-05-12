"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";
import { Button } from "@/components/ui/button";

const MESSAGES = [
  "SHOT NOT FOUND",
  "WRONG FRAME\nTRY AGAIN",
  "OUT OF FRAME",
  "THIS PAGE IS\nNOT IN THE BOOTH",
];

export default function NotFoundContent() {
  const [idx, setIdx] = useState(0);

  const next = useCallback(() => setIdx((i) => (i + 1) % MESSAGES.length), []);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="photobooth-page-surface flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <p className="text-xs tracking-[0.1em] text-primary mb-2 font-semibold uppercase">
          Error
        </p>
        <h1 className="font-heading text-8xl font-bold text-foreground leading-none">
          404
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>

      <TextFlippingBoard
        text={MESSAGES[idx]}
        className="w-full max-w-xl"
        duration={0.5}
      />

      <Button asChild size="lg">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
