/**
 * VibeLogger: Custom logger for AI-generated cards.
 * Logs Confidence Score and other AI generation metrics to the console.
 */
export const VibeLogger = {
  logCardGeneration: (front: string, back: string, confidenceScore: number) => {
    console.log(
      `%c[VibeLogger]%c Card Generated | Confidence: %c${confidenceScore}%c\nFront: ${front}\nBack: ${back}`,
      "color: #F59E0B; font-weight: bold;", // accent amber
      "color: inherit;",
      `color: ${confidenceScore > 0.8 ? '#10B981' : (confidenceScore > 0.5 ? '#F59E0B' : '#EF4444')}; font-weight: bold;`,
      "color: inherit;"
    );
  },
  
  info: (message: string, ...optionalParams: any[]) => {
    console.log(`%c[VibeLogger]%c ${message}`, "color: #3B82F6; font-weight: bold;", "color: inherit;", ...optionalParams);
  },
  
  error: (message: string, ...optionalParams: any[]) => {
    console.error(`%c[VibeLogger ERROR]%c ${message}`, "color: #EF4444; font-weight: bold;", "color: inherit;", ...optionalParams);
  }
};
