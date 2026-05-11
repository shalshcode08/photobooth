import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const AppHeader = () => {
  return (
    <header className="w-full shrink-0">
      <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/main-logo-light-theme.png"
            alt="Photobooth"
            width={150}
            height={100}
            className="dark:hidden"
            priority
          />
          <Image
            src="/main-logo-dark-theme.png"
            alt="Photobooth"
            width={150}
            height={100}
            className="hidden dark:block"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild>
            <Link href="/sign-up">
              Get Started <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
