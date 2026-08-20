import Image from "next/image";

const visuals = {
  entri: {
    alt: "Entri multilingual learning app language selection screen",
    image: "/images/projects/entri-app.webp",
  },
  tinkerspace: {
    alt: "People meeting and working together inside TinkerSpace in Kalamassery",
    image: "/images/projects/tinkerspace.webp",
  },
  makemypass: {
    alt: "MakeMyPass event management interface showing dates, registration and timezone controls",
    image: "/images/projects/makemypass-product.webp",
  },
  "kochi-buzz": {
    alt: "Kochi Buzz city-frequency illustration of the waterfront, port, metro and creative communities",
    image: "/images/kochi-city-frequency.webp",
  },
} as const;

export default function ProjectVisual({
  projectId,
  name,
  className = "",
  priority = false,
}: {
  projectId: string;
  name: string;
  className?: string;
  priority?: boolean;
}) {
  const visual = visuals[projectId as keyof typeof visuals];

  if (!visual) {
    return (
      <div className={`project-visual project-visual--unknown ${className}`}>
        <span>{name}</span>
      </div>
    );
  }

  return (
    <div className={`project-visual project-visual--${projectId} ${className}`}>
      <Image
        src={visual.image}
        alt={visual.alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="project-visual__image"
      />
      {projectId === "entri" && (
        <Image
          src="/images/projects/entri-logo.svg"
          alt=""
          width={128}
          height={47}
          className="project-visual__logo project-visual__logo--entri"
        />
      )}
      {projectId === "makemypass" && (
        <Image
          src="/images/projects/makemypass-logo.svg"
          alt=""
          width={148}
          height={46}
          className="project-visual__logo project-visual__logo--makemypass"
        />
      )}
      <span className="project-visual__source">Official source visual</span>
    </div>
  );
}
