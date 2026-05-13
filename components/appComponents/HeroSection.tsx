import { Camera, Images, Video, Zap } from "lucide-react";
import { WebcamPixelGrid } from "@/components/ui/webcam-pixel-grid";

const HeroSection = () => {
  return (
    <section className="relative isolate mx-auto flex min-h-[34rem] w-[calc(100%-1rem)] max-w-6xl flex-col items-center justify-center overflow-hidden border border-border bg-black px-4 py-14 text-center text-white sm:min-h-[42rem] sm:w-[calc(100%-2rem)] sm:px-8 sm:py-20 md:min-h-[45rem]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0">
          <WebcamPixelGrid
            gridCols={60}
            gridRows={40}
            maxElevation={46}
            motionSensitivity={0.25}
            elevationSmoothing={0.2}
            colorMode="webcam"
            backgroundColor="#030303"
            mirror
            gapRatio={0.05}
            darken={0.62}
            borderColor="#ffffff"
            borderOpacity={0.06}
            showErrorUI={false}
            className="h-full w-full"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.20)_0%,rgba(0,0,0,0.34)_42%,rgba(0,0,0,0.72)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/70" />
      </div>

      <h1 className="relative z-20 max-w-3xl text-balance font-heading text-[clamp(2.35rem,11vw,3.75rem)] leading-[1.04] font-semibold tracking-normal text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] sm:text-5xl md:text-6xl">
        Capture the moment.
        <br />
        Keep the memory.
      </h1>
      <div className="relative mt-4 w-full max-w-4xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1 left-[3%] z-10 hidden size-11 place-items-center border border-white/15 bg-white/10 text-blue-200 shadow-sm backdrop-blur-md photobooth-float sm:grid md:left-[7%]"
        >
          <Camera className="size-5" strokeWidth={1.8} />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-3 right-[4%] z-10 hidden size-10 place-items-center border border-white/15 bg-white/10 text-amber-200 shadow-sm backdrop-blur-md photobooth-float [animation-delay:-1.8s] sm:grid md:right-[8%]"
        >
          <Zap className="size-5" strokeWidth={1.9} />
        </div>
        <p className="relative z-20 mx-auto max-w-2xl text-sm leading-6 text-pretty text-white/65 sm:text-lg sm:leading-7">
          A beautiful photobooth for capturing moments worth saving.
        </p>

        <div className="relative mx-auto mt-8 grid h-24 w-full max-w-3xl place-items-center sm:mt-10 sm:h-32">
          <div className="absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[12%] top-2 z-20 grid size-10 place-items-center border border-white/15 bg-white/10 text-emerald-200 shadow-sm backdrop-blur-md photobooth-float [animation-delay:-2.6s] sm:left-[18%] sm:size-11"
          >
            <Images className="size-5" strokeWidth={1.8} />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[12%] bottom-2 z-20 grid size-9 place-items-center border border-white/15 bg-white/10 text-rose-200 shadow-sm backdrop-blur-md photobooth-float [animation-delay:-3.8s] sm:right-[18%] sm:size-10"
          >
            <Video className="size-4 sm:size-5" strokeWidth={1.8} />
          </div>
          <div className="relative z-10 border border-white/15 bg-black/20 px-5 py-2 text-xs font-medium tracking-wide text-white/55 backdrop-blur-md">
            Showcase media coming next
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
