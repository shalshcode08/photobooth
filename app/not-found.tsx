import type { Metadata } from "next";
import NotFoundContent from "@/components/appComponents/NotFoundContent";

export const metadata: Metadata = {
  title: "404 — Page Not Found | PhotoBooth",
  description: "The page you are looking for doesn't exist.",
};

export default function NotFound() {
  return <NotFoundContent />;
}
