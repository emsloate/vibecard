import { VibeLogger } from "@/utils/VibeLogger";

export default function Home() {
  // Fire some test logs to verify VibeLogger is working
  VibeLogger.info("VibeCard application initialized. Welcome to the Terminal-Density UI.");
  VibeLogger.logCardGeneration("What is the Central Limit Theorem?", "The phenomenon where...", 0.95);

  return (
    <div className="flex min-h-full flex-col items-center justify-center p-8 sm:p-24 font-sans bg-background text-foreground">
      <div className="max-w-2xl w-full border border-border p-8 rounded-md bg-background shadow-2xl">
        <h1 className="text-3xl font-bold mb-4 font-mono text-accent">{"<VibeCard />"}</h1>
        <p className="mb-6 text-muted">
          The Zero-Friction AI-Native SRS Platform. Phase 1 initialized.
        </p>
        
        <div className="bg-card p-4 rounded border border-border font-mono text-sm mb-6">
          <p className="text-muted mb-2"># Terminal-Density Spec Test</p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-border">
            <span className="mb-1 sm:mb-0"><span className="text-accent mr-2">Front:</span>What is the primary effect of an L1 penalty in Lasso regression?</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2">
            <span><span className="text-accent mr-2">Back:</span><span className="text-muted">It can shrink coefficients to exactly zero, performing automatic feature selection.</span></span>
          </div>
        </div>

        <div className="flex gap-4 font-mono text-sm">
          <button className="px-4 py-2 bg-accent text-black font-bold hover:opacity-90 transition-opacity rounded">
            [Approve]
          </button>
          <button className="px-4 py-2 border border-border text-foreground hover:bg-card-hover transition-colors rounded">
            [Trash]
          </button>
        </div>
      </div>
    </div>
  );
}
