import Image from "next/image";
import BoothCamera from "@/components/appComponents/BoothCamera";
import PhotoGallery from "@/components/appComponents/PhotoGallery";

export default function BoothPage() {
  return (
    <div className="booth-mesh-bg relative flex h-dvh flex-col overflow-hidden">
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
      <div className="relative z-10 flex flex-1 min-h-0 flex-col overflow-hidden lg:flex-row">
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
