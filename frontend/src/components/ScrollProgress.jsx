import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const tween = gsap.to(barRef.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.2
      }
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return <div ref={barRef} className="fixed left-0 top-0 z-[100] h-1 w-full origin-left scale-x-0 bg-orange shadow-[0_0_18px_rgba(253,118,26,0.75)]" />;
}
