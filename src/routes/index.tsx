import { createFileRoute } from "@tanstack/react-router";
import { MusicLab } from "@/components/lab/music-lab";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <MusicLab />;
}
