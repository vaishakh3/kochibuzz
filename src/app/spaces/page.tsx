import { permanentRedirect } from "next/navigation";

/** Legacy URL — spaces are now listed at /places. */
export default function LegacySpacesPage() {
  permanentRedirect("/places");
}
