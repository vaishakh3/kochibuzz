import GlobalFooter from "@/components/GlobalFooter";
import GlobalHeader from "@/components/GlobalHeader";

type Props = {
  current: string;
  /** Allow child sections to bleed full-width; content manages its own container. */
  fullBleed?: boolean;
  children: React.ReactNode;
};

/** Full-width page canvas: header, content, footer. The page IS the surface. */
export default function SiteShell({ current, fullBleed = false, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <GlobalHeader current={current} />
      <main
        id="main-content"
        className={
          fullBleed
            ? "flex-1"
            : "mx-auto w-full max-w-[1200px] flex-1 px-4 pt-10 sm:px-6"
        }
      >
        {children}
      </main>
      <GlobalFooter />
    </div>
  );
}
