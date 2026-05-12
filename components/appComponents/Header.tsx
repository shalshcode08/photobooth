import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MobileHeaderMenu from "@/components/appComponents/MobileHeaderMenu";
// import ThemeToggle from "./ThemeToggle";

const AppHeader = () => {
  return (
    <header className="w-full shrink-0">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-2 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/main-logo-light-theme.png"
            alt="Photobooth"
            width={150}
            height={100}
            className="h-auto w-24 dark:hidden sm:w-[100px]"
            priority
          />
          <Image
            src="/main-logo-dark-theme.png"
            alt="Photobooth"
            width={150}
            height={100}
            className="hidden h-auto w-24 dark:block sm:w-[100px]"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          {/* <ThemeToggle /> */}
          <Button asChild className="hidden md:inline-flex">
            <Link href="/sign-up">
              Get Started <ArrowRight />
            </Link>
          </Button>
          <MobileHeaderMenu />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
