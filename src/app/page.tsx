import CalendarApp from "@/components/CalendarApp";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="aurora aurora-one" aria-hidden />
      <div className="aurora aurora-two" aria-hidden />
      <div className="aurora aurora-three" aria-hidden />
      <div className="relative z-10 w-full">
        <CalendarApp />
      </div>
    </main>
  );
}
