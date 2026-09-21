import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DoniVerse",
    short_name: "DoniVerse",
    description: "Your whole campus world, in one place.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#edf2ed",
    theme_color: "#174d31",
    orientation: "portrait-primary",
    categories: ["education", "navigation", "social"],
    lang: "en",
  };
}
