/* eslint-disable @next/next/no-img-element -- ImageResponse requires a plain image element. */
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { CategoryId, categoryById, eventById } from "@/data/events";
import { formatDateRange, formatTimeRange, parseDate } from "@/lib/calendar";

const MONTHS_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const categoryHex: Record<CategoryId, string> = {
  hackathon: "#a78bfa",
  ai: "#fbbf24",
  opensource: "#34d399",
  startup: "#38bdf8",
  security: "#f87171",
  enterprise: "#94a3b8",
  cloud: "#22d3ee",
  webdev: "#f472b6",
};

export async function GET(request: NextRequest): Promise<ImageResponse> {
  const id = request.nextUrl.searchParams.get("e");
  const event = id ? eventById.get(id) : undefined;
  const accent = event ? categoryHex[event.category] : "#d7f24b";
  const start = event ? parseDate(event.start) : undefined;
  const backgroundResponse = await fetch(
    new URL("/images/broadcast/kochi-on-air-social.jpg", request.url),
  );
  const socialBackground = `data:image/jpeg;base64,${Buffer.from(
    await backgroundResponse.arrayBuffer(),
  ).toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 58,
        background: "#0b0b12",
        color: "white",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <img
        src={socialBackground}
        alt=""
        width="1200"
        height="630"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(7,8,15,.98) 0%, rgba(7,8,15,.86) 34%, rgba(7,8,15,.15) 67%, rgba(7,8,15,.05) 100%)",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: -180,
          right: -120,
          width: 480,
          height: 480,
          borderRadius: 480,
          background: accent,
          opacity: event ? 0.22 : 0.08,
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#d7f24b",
            }}
          >
              {event ? "Kochi Buzz · Event signal" : "Kochi on air · Visual city broadcast"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 46,
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            kochi
            <span
              style={{
                display: "flex",
                color: "#d7f24b",
              }}
            >
              .buzz
            </span>
          </div>
        </div>
        {start && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 28px",
              borderRadius: 24,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 56,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {start.getDate()}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                letterSpacing: 4,
                marginTop: 6,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {MONTHS_SHORT[start.getMonth()]}
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {event && (
          <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 24,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "#0d0d10",
                background: accent,
              }}
            >
              {categoryById.get(event.category)!.label}
            </div>
            {event.travel && (
              <div
                style={{
                  display: "flex",
                  padding: "8px 20px",
                  borderRadius: 999,
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#0d0d10",
                  background: "white",
                }}
              >
                Outside Kochi
              </div>
            )}
          </div>
        )}
        <div
          style={{
            display: "flex",
            fontSize: event ? 62 : 82,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          {event ? event.title : "The city is talking."}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            marginTop: 24,
            color: "#cbd5e1",
          }}
        >
          {event
            ? `${formatDateRange(event)} · ${formatTimeRange(event)} · ${event.venue}, ${event.city}`
            : "Outside · People · Work · Build"}
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
