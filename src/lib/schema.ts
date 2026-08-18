import { TechEvent } from "@/data/events";

type EventSchema = {
  "@type": "Event";
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  url: string;
  eventAttendanceMode: string;
  location: {
    "@type": "Place";
    name: string;
    address: { "@type": "PostalAddress"; addressLocality: string; addressCountry: string };
  };
  organizer: { "@type": "Organization"; name: string };
};

export function eventSchema(event: TechEvent): EventSchema {
  const startDate = event.startTime
    ? `${event.start}T${event.startTime}:00+05:30`
    : event.start;
  const endDate = event.endTime
    ? `${event.end}T${event.endTime}:00+05:30`
    : event.end;
  return {
    "@type": "Event",
    name: event.title,
    startDate,
    endDate,
    description: event.blurb,
    url: `https://kochi.buzz/?e=${event.id}`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city,
        addressCountry: "IN",
      },
    },
    organizer: { "@type": "Organization", name: event.organizer },
  };
}

export function eventListJsonLd(events: TechEvent[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kochi tech events",
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: eventSchema(event),
    })),
  });
}

export function eventJsonLd(event: TechEvent): string {
  return JSON.stringify({ "@context": "https://schema.org", ...eventSchema(event) });
}
