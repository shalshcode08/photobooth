import AppHeader from "@/components/appComponents/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="photobooth-page-surface flex min-h-dvh flex-col">
      <AppHeader />
      {children}
    </div>
  );
}
