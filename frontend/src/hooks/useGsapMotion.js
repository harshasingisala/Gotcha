import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGsapMotion(scopeRef) {
  useEffect(() => {
    if (!scopeRef.current) return undefined;

    const scope = scopeRef.current;
    const context = gsap.context(() => {
      gsap.utils.toArray(".motion-reveal").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 84%",
              once: true
            }
          }
        );
      });

      gsap.utils.toArray("[data-parallax]").forEach((element) => {
        const depth = Number(element.dataset.parallax || 0.16);
        gsap.to(element, {
          yPercent: -100 * depth,
          ease: "none",
          scrollTrigger: {
            trigger: element.closest("[data-parallax-scene]") || element,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });

      gsap.utils.toArray("[data-counter]").forEach((element) => {
        const target = Number(element.dataset.counter || 0);
        const suffix = element.dataset.suffix || "";
        const state = { value: 0 };
        gsap.to(state, {
          value: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true
          },
          onUpdate: () => {
            element.textContent = `${Math.round(state.value).toLocaleString()}${suffix}`;
          }
        });
      });

      gsap.utils.toArray("[data-float]").forEach((element, index) => {
        gsap.to(element, {
          y: index % 2 ? 14 : -14,
          rotate: index % 2 ? 1.2 : -1.2,
          duration: 2.6 + index * 0.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      });
    }, scope);

    const tiltElements = Array.from(scope.querySelectorAll("[data-tilt]"));
    const cleanups = tiltElements.map((element) => {
      const onMove = (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(element, {
          rotateY: x * 8,
          rotateX: -y * 8,
          y: -4,
          transformPerspective: 800,
          duration: 0.35,
          ease: "power2.out"
        });
      };
      const onLeave = () => {
        gsap.to(element, {
          rotateY: 0,
          rotateX: 0,
          y: 0,
          duration: 0.45,
          ease: "elastic.out(1, 0.45)"
        });
      };
      element.addEventListener("mousemove", onMove);
      element.addEventListener("mouseleave", onLeave);
      return () => {
        element.removeEventListener("mousemove", onMove);
        element.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, [scopeRef]);
}
