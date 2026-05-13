import Image from "next/image";
import BoothCamera from "@/components/appComponents/BoothCamera";
import PhotoGallery from "@/components/appComponents/PhotoGallery";
import { cn } from "@/lib/utils";

export default function BoothPage() {
  return (
    <div className="booth-mesh-bg relative flex min-h-dvh flex-col overflow-x-hidden lg:h-dvh lg:overflow-hidden">
      {/* Dotted grid layer — sits on top of the mesh gradient, behind content */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 opacity-75 mix-blend-multiply",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(rgba(60,40,20,0.42)_1px,transparent_1px)]",
          "[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]",
          "dark:opacity-60 dark:mix-blend-screen",
          "dark:[background-image:radial-gradient(rgba(255,220,180,0.35)_1px,transparent_1px)]",
        )}
      />
      <div className="relative z-10 flex shrink-0 justify-center px-4 py-2">
        <Image
          src="/main-logo-light-theme.png"
          alt="Photobooth"
          width={150}
          height={100}
          className="h-auto w-24 dark:hidden sm:w-[200px]"
          priority
        />
        <Image
          src="/main-logo-dark-theme.png"
          alt="Photobooth"
          width={150}
          height={100}
          className="hidden h-auto w-24 dark:block sm:w-[150px]"
          priority
        />
      </div>
      <div className="relative z-10 flex flex-1 flex-col lg:min-h-0 lg:overflow-hidden lg:flex-row">
        <BoothCamera />
        <div className="absolute bottom-0 right-0 top-0 hidden items-center lg:flex">
          <PhotoGallery />
        </div>
        <div className="shrink-0 lg:hidden">
          <PhotoGallery compact />
        </div>
      </div>
    </div>
  );
}
