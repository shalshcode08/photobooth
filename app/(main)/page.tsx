import CatShowcaseSection from "@/components/appComponents/CatShowcaseSection";
import FeatureSection from "@/components/appComponents/FeatureSection";
import Footer from "@/components/appComponents/Footer";
import HeroSection from "@/components/appComponents/HeroSection";
import PageScrollMotion from "@/components/appComponents/PageScrollMotion";
import ProcessSection from "@/components/appComponents/ProcessSection";
import ShowcaseSection from "@/components/appComponents/ShowcaseSection";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1">
        <PageScrollMotion>
          <HeroSection />
          <FeatureSection />
        </PageScrollMotion>
        <CatShowcaseSection />
        <PageScrollMotion>
          <ShowcaseSection />
          <ProcessSection />
          <Footer />
        </PageScrollMotion>
      </main>
    </div>
  );
}
