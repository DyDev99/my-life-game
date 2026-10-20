import type { MetadataRoute } from "next";

// "Add to Home Screen" launches the game full-screen in landscape, like a native game.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ជីវិតខ្ញុំ (My Life)",
    short_name: "My Life",
    description: "A modern Cambodian life simulation set in Kampong Cham.",
    start_url: "/",
    display: "fullscreen",
    orientation: "landscape",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
