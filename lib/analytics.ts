// Helper for Google Analytics 4 (GA4)

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js",
      targetIdOrAction: string | Date,
      options?: Record<string, unknown>
    ) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export const trackEvent = (
  action: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
};
