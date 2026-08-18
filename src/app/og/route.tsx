import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { eventById } from "@/data/events";
import { formatDateRange, formatTimeRange } from "@/lib/calendar";

export const runtime = "edge";

export function GET(request: NextRequest): ImageResponse {
  const id = request.nextUrl.searchParams.get("e");
  const event = id ? eventById.get(id) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0d0d10 0%, #17122b 60%, #2a1a4d 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#c4b5fd",
            }}
          >
            Kochi Tech Events
          </div>
          <div style={{ display: "flex", fontSize: 54, fontWeight: 700, marginTop: 8 }}>
            kochi<span style={{ color: "#a78bfa" }}>.buzz</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: event ? 64 : 44,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            {event ? event.title : "What's buzzing in Kochi tech"}
          </div>
          <div style={{ display: "flex", fontSize: 30, marginTop: 24, color: "#cbd5e1" }}>
            {event
              ? `${formatDateRange(event)} · ${formatTimeRange(event)} · ${event.venue}, ${event.city}`
              : "Hackathons, AI meetups, open source conferences and startup summits"}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
