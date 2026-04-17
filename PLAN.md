# MISSION: Build "VibeCard" — The Zero-Friction AI-Native SRS Platform

## 1. CORE PHILOSOPHY
**"Creation is the Bottleneck."** VibeCard exists to destroy the friction between *learning* something and *scheduling* it. The UI must be a "Pro-Tool" (Bloomberg Terminal/Obsidian aesthetic): high density, low chrome, keyboard-first.

## 2. PRIMARY FEATURES (WITH SPECIFIC EXAMPLES)

### A. AI Autocomplete ("Ghost Text" Creation)
* **The Logic:** As a user types the "Front," the LLM predicts the "Back."
* **The UX:** Display the suggestion in `#6B7280` (gray) text. Press `Tab` to accept.
* **Example:**
    * **User Types (Front):** `What is the Central Limit Theorem?`
    * **AI Suggests (Back):** `[The phenomenon where the distribution of sample means approximates a normal distribution as the sample size becomes large, regardless of the population's distribution.]`
    * **User Action:** Hits `Tab`. The card is created.

### B. Chat-to-Card Factory
* **The Logic:** A sidebar chat where the user explores topics. The user can "Harvest" the chat for cards.
* **Example Conversation:**
    * **User:** "Explain the difference between Ridge and Lasso regression."
    * **AI:** "Ridge adds an L2 penalty (squared magnitude), which shrinks coefficients but keeps them non-zero. Lasso adds an L1 penalty, which can shrink coefficients exactly to zero, performing feature selection."
    * **User:** "Generate cards from this."
    * **Result (Staging Queue):**
        1.  **Front:** `What is the primary effect of an L1 penalty in Lasso regression?` | **Back:** `It can shrink coefficients to exactly zero, performing automatic feature selection.`
        2.  **Front:** `Ridge regression uses which type of penalty?` | **Back:** `L2 penalty (squared magnitude).`

### C. The "Staging Area" (Approval Queue)
* **The Logic:** AI-generated cards never go directly to a deck. They land in a "Staging" list.
* **UX:** A vertical list of cards with `[Edit]`, `[Approve]`, and `[Trash]` buttons.
* **High-Density Metric:** At least 8 staging cards must be visible on a standard 1080p screen simultaneously.

## 3. SECONDARY PIPELINES (MODULAR PLUGINS)

### A. "Naturalist" Vision (Austin-Specific)
* **The Logic:** Multimodal identification with a bias toward Central Texas biodiversity.
* **Example:**
    * **Input:** Photo of a bird at Lady Bird Lake.
    * **AI Identification:** "Barn Swallow (Hirundo rustica)."
    * **Generated Card:**
        * **Front:** `[Image of Bird]`
        * **Back:** `Barn Swallow. Note the deeply forked tail. Commonly found nesting under Austin bridges (like Congress Ave) in spring.`

### B. Math & Physics (LaTeX Accuracy)
* **The Logic:** Image -> KaTeX conversion for mathematically dense cards.
* **Example:**
    * **Input:** Screenshot of a handwritten Schrödinger Equation.
    * **Output JSON:** `{"front": "Schrödinger Equation (Time-Independent)", "back": "$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)$$"}`

## 4. TECHNICAL SPECIFICATIONS

### Spaced Repetition (SM-2 Algorithm)
Every card in the database must track:
1.  **Ease Factor (EF):** Default `2.5`.
2.  **Interval (I):** Days until next review.
3.  **Repetitions (n):** Successful review count.
4.  **Math Formula:** $I(n) = I(n-1) \times EF$. If $n=1$, $I=1$. If $n=2$, $I=6$.

### Anki Compatibility (The CSV Bridge)
* **Importer Specification:** Build a Tab-Separated/CSV Importer that maps existing Anki exports to the VibeCard schema.
* **Example Row:** `FrontText, BackText, 2.5, 10, 4` -> `front_text`, `back_text`, `ease_factor`, `interval`, `reps`.

## 5. UI/UX: THE "TERMINAL-DENSITY" SPEC
* **Theme Preference:** Implement a **Dark Mode / Light Mode toggle**. 
* **Dark Mode (Default):** `bg-[#0D0D0D]`, `text-[#E5E7EB]`, `accent-[#F59E0B]` (Amber).
* **Light Mode:** High-contrast "Paper" aesthetic (Obsidian/Notion style).
* **Typography:** Monospace for code/math (IBM Plex Mono), sans-serif for prose (Inter).
* **Thumb-Zone:** On mobile, "Again/Hard/Good/Easy" buttons must be large and within the bottom 25% of the screen.

---

## Vibe Coding Guardrails (For the Agent)
* **Context Check:** Always read `SESSION_CONTEXT.md` before starting a task.
* **Atomic Updates:** Do not rewrite entire files for minor changes; use specific component isolation.
* **Logging:** Every AI-generated card must log its "Confidence Score" to a custom `VibeLogger` console.

## Initial Launch Tasks
1.  **Phase 1 (Infrastructure):** Next.js 16 + Supabase + Tailwind; setup `cards` with SM-2 fields.
2.  **Phase 2 (Core CRUD):** Build Deck/Card management with standard Manual Creation.
3.  **Phase 3 (Theme Engine):** Implement Dark/Light mode toggle and system preference detection.
4.  **Phase 4 (AI Autocomplete):** Implement real-time "Ghost Text" logic for the desktop creation view.
5.  **Phase 5 (Chat-to-Card):** Build the Chat interface and context-aware card generation staging queue.
