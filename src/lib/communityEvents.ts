import { DirectoryCommunity } from "@/data/directory";
import { TechEvent, events } from "@/data/events";
import { sortByStart, toISODate, todayInIST } from "@/lib/calendar";

export type CommunityEvents = {
  upcoming: TechEvent[];
  past: TechEvent[];
};

/** Events whose organizer is mapped to this community, split around today (IST). */
export function communityEvents(community: DirectoryCommunity): CommunityEvents {
  const organizers = community.eventOrganizers;
  if (!organizers) return { upcoming: [], past: [] };

  const iso = toISODate(todayInIST());
  const mine = events
    .filter((event) => organizers.includes(event.organizer))
    .sort(sortByStart);

  return {
    upcoming: mine.filter((event) => event.end >= iso),
    past: mine.filter((event) => event.end < iso).reverse(),
  };
}
