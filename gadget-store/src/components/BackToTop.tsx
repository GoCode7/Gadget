import { useEffect, useState } from "react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > 600);
    };

    updateVisibility();

    window.addEventListener("scroll", updateVisibility, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Move keyboard focus back to the page heading before
    // the button disappears as the page scrolls upward.
    const heading = document.querySelector<HTMLHeadingElement>("main h1");

    if (heading) {
      const originalTabIndex = heading.getAttribute("tabindex");

      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });

      if (originalTabIndex === null) {
        heading.removeAttribute("tabindex");
      } else {
        heading.setAttribute("tabindex", originalTabIndex);
      }
    }

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "instant" : "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="
        fixed bottom-5 left-5 z-40
        inline-flex h-12 w-12 items-center justify-center
        rounded-2xl border border-white/15
        bg-[#0b1739] text-white
        shadow-[0_8px_28px_rgba(11,23,57,0.24)]
        transition duration-200
        hover:-translate-y-1 hover:bg-blue-600
        active:translate-y-0
        focus-visible:outline-none
        focus-visible:ring-4 focus-visible:ring-blue-300
        focus-visible:ring-offset-2
        motion-reduce:transform-none motion-reduce:transition-none
        sm:bottom-7 sm:left-7
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 12 6-6 6 6" />
        <path d="M12 6v13" />
      </svg>
    </button>
  );
}