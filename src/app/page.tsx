import { ChatInterface } from "@/components/ChatInterface";
import { StagingQueue } from "@/components/StagingQueue";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex h-full p-6 sm:p-8 gap-8 max-w-[1600px] mx-auto overflow-hidden">
      {/* Left Pane: Chat-to-Card Factory */}
      <div className="flex-1 w-1/2 min-w-[300px] h-full flex flex-col">
        <h1 className="text-2xl font-bold font-mono text-accent mb-4">Chat Factory</h1>
        <div className="flex-1 min-h-0">
          <ChatInterface />
        </div>
      </div>

      {/* Right Pane: Staging Area */}
      <div className="flex-1 w-1/2 min-w-[350px] h-full flex flex-col">
        <h1 className="text-2xl font-bold font-mono text-foreground mb-4 opacity-0 select-none hidden md:block">Spacing</h1>
        <div className="flex-1 min-h-0">
          <StagingQueue />
        </div>
      </div>
    </div>
  );
}
