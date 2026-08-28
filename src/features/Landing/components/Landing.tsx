import React, { Suspense, useEffect } from "react";
import "../style/landing.css";
import { useIsMobile } from "@shared/hooks/useIsMobile";

// Each layout owns its expensive bundle. Phones never download the cubicle.
const MobileLanding = React.lazy(() =>
  import("../../Mobile/MobileLanding").then((m) => ({
    default: m.MobileLanding,
  })),
);
const LandingScene = React.lazy(() => import("./LandingScene"));

const Landing: React.FC = () => {
  const isMobile = useIsMobile();

  // Prevent scrolling on the landing page (3D scene should fill viewport)
  useEffect(() => {
    // Save original overflow values
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    // Set overflow hidden for landing page
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Restore original overflow when component unmounts
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  if (isMobile) {
    return (
      <Suspense
        fallback={
          <div
            style={{ width: "100%", height: "100%", background: "#1e3a8a" }}
          />
        }
      >
        <MobileLanding />
      </Suspense>
    );
  }

  return (
    <div className="landing-page">
      <Suspense
        fallback={
          <div
            style={{ width: "100%", height: "100%", background: "#1e3a8a" }}
          />
        }
      >
        <LandingScene />
      </Suspense>
    </div>
  );
};

export default Landing;
