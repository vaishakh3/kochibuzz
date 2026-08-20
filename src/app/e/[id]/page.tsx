import { permanentRedirect } from "next/navigation";

type Params = Promise<{ id: string }>;

/** Legacy event URLs — canonical pages now live at /events/[slug]. */
export default async function LegacyEventPage({ params }: { params: Params }) {
  const { id } = await params;
  permanentRedirect(`/events/${id}`);
}
