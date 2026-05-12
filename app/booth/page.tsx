import Image from "next/image";
import BoothCamera from "@/components/appComponents/BoothCamera";
import PhotoGallery from "@/components/appComponents/PhotoGallery";
import { cn } from "@/lib/utils";

export default function BoothPage() {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-white dark:bg-black">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
      <div className="relative z-10 flex justify-center py-2">
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
      <div className="relative z-10 flex flex-1 overflow-hidden">
        <BoothCamera />
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          <PhotoGallery />
        </div>
      </div>
    </div>
  );
}
