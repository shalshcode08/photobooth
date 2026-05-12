import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mx-auto w-full max-w-5xl px-6 pt-10 pb-12">
      <div className="border-t border-border pt-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/main-logo-light-theme.png"
                alt="Photobooth"
                width={116}
                height={92}
                className="h-auto w-28 dark:hidden object-none"
              />
              <Image
                src="/main-logo-dark-theme.png"
                alt="Photobooth"
                width={116}
                height={92}
                className="hidden h-auto w-28 dark:block object-none"
              />
            </Link>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A simple place to capture, frame, and keep the moments that
              matter.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link
              href="/sign-in"
              className="transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="transition-colors hover:text-foreground"
            >
              Get started
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>PhotoBooth</p>
          <p>Built for memories worth saving.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
