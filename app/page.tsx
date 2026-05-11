import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col">
      <Link href={"/sign-in"}>Get Started</Link>
    </main>
  );
}
