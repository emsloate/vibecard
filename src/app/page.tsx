import { VibeLogger } from "@/utils/VibeLogger";

export default function Home() {
  // Fire some test logs to verify VibeLogger is working
  VibeLogger.info("VibeCard application initialized. Welcome to the Terminal-Density UI.");
  VibeLogger.logCardGeneration("What is the Central Limit Theorem?", "The phenomenon where...", 0.95);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-24 font-sans bg-background text-foreground">
      <div className="max-w-2xl w-full border border-gray-800 p-8 rounded-md bg-[#0D0D0D] shadow-2xl">
        <h1 className="text-3xl font-bold mb-4 font-mono text-accent">{"<VibeCard />"}</h1>
        <p className="mb-6 text-gray-400">
          The Zero-Friction AI-Native SRS Platform. Phase 1 initialized.
        </p>
        
        <div className="bg-[#050505] p-4 rounded border border-gray-800 font-mono text-sm mb-6">
          <p className="text-gray-500 mb-2"># Terminal-Density Spec Test</p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-gray-800">
            <span className="mb-1 sm:mb-0"><span className="text-accent mr-2">Front:</span>What is the primary effect of an L1 penalty in Lasso regression?</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2">
            <span><span className="text-accent mr-2">Back:</span><span className="text-[#6B7280]">It can shrink coefficients to exactly zero, performing automatic feature selection.</span></span>
          </div>
        </div>

        <div className="flex gap-4 font-mono text-sm">
          <button className="px-4 py-2 bg-accent text-black font-bold hover:opacity-90 transition-opacity rounded">
            [Approve]
          </button>
          <button className="px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors rounded">
            [Trash]
          </button>
        </div>
      </div>
    </main>
  );
}
