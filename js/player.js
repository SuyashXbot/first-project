/**
 * ChoiceScript Game Player for TaleForge
 * High-immersion interactive fiction player with stats modal,
 * undo history, checkpoints, and theme settings.
 */

class ChoiceScriptPlayer {
  constructor(storage) {
    this.storage = storage;
    this.currentGame = null;
    this.engine = null;
    this.currentStep = null;
    this.selectedOptionId = null;
  }

  async loadGame(gameId) {
    const game = this.storage.getGameById(gameId);
    if (!game) {
      alert('ChoiceScript game not found.');
      window.location.hash = '#games';
      return;
    }

    this.currentGame = game;

    // Retrieve script text
    let scriptText = game.scriptText;
    if (!scriptText && game.scriptPath) {
      try {
        const resp = await fetch(game.scriptPath);
        if (resp.ok) {
          scriptText = await resp.text();
          // Cache in game object
          game.scriptText = scriptText;
        } else {
          throw new Error(`Failed to load ${game.scriptPath}`);
        }
      } catch (e) {
        console.error('Error fetching ChoiceScript script:', e);
        alert('Could not load ChoiceScript game file.');
        return;
      }
    }

    if (!scriptText) {
      alert('This game does not contain any ChoiceScript code.');
      return;
    }

    // Initialize ChoiceScript Engine
    this.engine = new ChoiceScriptEngine(scriptText);
    this.currentStep = this.engine.nextStep();
    this.selectedOptionId = null;

    // Track on shelf
    this.storage.addToShelf(game.id);

    this.render();
  }

  render() {
    const container = document.getElementById('player-view');
    if (!container) return;

    const game = this.currentGame;
    const step = this.currentStep;
    const canUndo = this.engine.history.length > 0;

    container.innerHTML = `
      <!-- Player Header Bar -->
      <div class="player-header sticky top-0 z-30 transition-all duration-300">
        <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center space-x-3 overflow-hidden">
            <a href="#games" class="reader-nav-btn" title="Back to Games">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </a>
            <div class="truncate">
              <div class="text-xs text-brand-muted uppercase font-bold tracking-wider">ChoiceScript Game</div>
              <div class="text-sm font-semibold text-brand-light truncate">${this.escapeHTML(game.title)}</div>
            </div>
          </div>

          <!-- Game Controls Toolbar -->
          <div class="flex items-center space-x-2">
            <!-- Stats Button -->
            <button id="player-stats-btn" class="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center font-medium shadow-sm">
              <svg class="w-4 h-4 mr-1 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              <span>Show Stats</span>
            </button>

            <!-- Undo Button -->
            <button id="player-undo-btn" class="reader-tool-btn ${canUndo ? '' : 'opacity-40 cursor-not-allowed'}" title="Undo Last Choice" ${canUndo ? '' : 'disabled'}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
            </button>

            <!-- Restart Button -->
            <button id="player-restart-btn" class="reader-tool-btn" title="Restart Game">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Screen Modal / Drawer -->
      <div id="player-stats-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 class="text-base font-bold text-brand-light flex items-center">
              <svg class="w-5 h-5 mr-2 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Character Stats & Attributes
            </h3>
            <button id="player-close-stats-btn" class="text-brand-muted hover:text-white p-1 rounded-lg">✕</button>
          </div>

          <div id="player-stats-body" class="space-y-4 max-h-96 overflow-y-auto pr-1">
            ${this.renderStatsContent(step.stats || this.engine.getStatsDisplay())}
          </div>

          <div class="pt-2">
            <button id="player-dismiss-stats-btn" class="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold">
              Return to Story
            </button>
          </div>
        </div>
      </div>

      <!-- Story Stage -->
      <main class="max-w-2xl mx-auto px-5 py-8 md:py-12">
        <div class="story-passage card p-6 md:p-10 shadow-2xl space-y-6 animate-fade-in font-serif text-base md:text-lg leading-relaxed text-brand-light/95">
          
          <!-- Prose Paragraphs -->
          <div class="space-y-5">
            ${
              step.paragraphs && step.paragraphs.length > 0
                ? step.paragraphs.map((p) => `<p>${p}</p>`).join('')
                : `<p class="italic text-brand-muted">Proceeding with your choice...</p>`
            }
          </div>

          <!-- Interaction Box (Choices, Page Break, or Ending) -->
          <div class="interaction-area pt-6 border-t border-white/10 mt-8">
            ${this.renderInteractionArea(step)}
          </div>

        </div>
      </main>
    `;

    this.bindPlayerEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderInteractionArea(step) {
    if (step.type === 'page_break') {
      return `
        <div class="text-center sm:text-right">
          <button id="step-continue-btn" class="btn-primary text-base px-8 py-3 rounded-xl font-bold inline-flex items-center shadow-lg hover:scale-105 transition-transform">
            <span>${this.escapeHTML(step.buttonLabel || 'Continue')}</span>
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      `;
    }

    if (step.type === 'choice') {
      return `
        <div class="space-y-4">
          <div class="text-xs font-bold uppercase tracking-wider text-brand-accent">Make your decision:</div>
          <div class="space-y-2.5" role="radiogroup">
            ${step.options
              .map(
                (opt) => `
              <label class="choice-option-card flex items-start p-3.5 md:p-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-brand-primary/60 cursor-pointer transition-all ${
                opt.selectable ? '' : 'opacity-40 cursor-not-allowed hover:bg-transparent hover:border-white/15'
              }">
                <input type="radio" name="cs-option" value="${opt.id}" class="mt-1 mr-3 text-brand-primary focus:ring-brand-primary" ${
                  opt.selectable ? '' : 'disabled'
                } />
                <span class="text-sm md:text-base font-sans font-medium text-brand-light/90 leading-snug">${opt.label}</span>
              </label>
            `
              )
              .join('')}
          </div>

          <div class="pt-4 flex justify-end">
            <button id="step-confirm-choice-btn" class="btn-primary text-sm px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg opacity-50 cursor-not-allowed" disabled>
              <span>Confirm Choice</span>
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </button>
          </div>
        </div>
      `;
    }

    if (step.type === 'ending') {
      return `
        <div class="text-center py-6 space-y-4">
          <div class="inline-flex p-3 rounded-full bg-brand-primary/20 text-brand-accent mb-2">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          </div>
          <h3 class="text-2xl font-extrabold text-brand-light">The Story Has Concluded</h3>
          <p class="text-sm text-brand-muted max-w-md mx-auto">Thank you for experiencing this interactive ChoiceScript adventure! You can view your final stats or play again to discover different branches and endings.</p>
          <div class="pt-4 flex items-center justify-center space-x-3">
            <button id="step-restart-btn" class="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>Play Again</span>
            </button>
            <a href="#games" class="btn-secondary px-6 py-2.5 rounded-xl text-sm font-semibold">
              Browse More Games
            </a>
          </div>
        </div>
      `;
    }

    return '';
  }

  renderStatsContent(statsList) {
    if (!statsList || statsList.length === 0) {
      return `<div class="text-center text-sm text-brand-muted py-4">No attributes recorded yet.</div>`;
    }

    return statsList
      .map((item) => {
        if (item.type === 'percent') {
          const num = typeof item.value === 'number' ? Math.min(100, Math.max(0, item.value)) : 50;
          return `
          <div class="stat-bar-group space-y-1">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-brand-light">${this.escapeHTML(item.label)}</span>
              <span class="text-brand-accent">${num}%</span>
            </div>
            <div class="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-all duration-500" style="width: ${num}%"></div>
            </div>
          </div>
        `;
        } else {
          return `
          <div class="flex items-center justify-between py-2 border-b border-white/5 text-sm">
            <span class="text-brand-muted">${this.escapeHTML(item.label)}</span>
            <span class="font-semibold text-brand-light">${this.escapeHTML(String(item.value))}</span>
          </div>
        `;
        }
      })
      .join('');
  }

  bindPlayerEvents() {
    // Stats Modal toggle
    const statsBtn = document.getElementById('player-stats-btn');
    const statsModal = document.getElementById('player-stats-modal');
    const closeStatsBtn = document.getElementById('player-close-stats-btn');
    const dismissStatsBtn = document.getElementById('player-dismiss-stats-btn');

    const showStats = () => statsModal?.classList.remove('hidden');
    const hideStats = () => statsModal?.classList.add('hidden');

    if (statsBtn) statsBtn.onclick = showStats;
    if (closeStatsBtn) closeStatsBtn.onclick = hideStats;
    if (dismissStatsBtn) dismissStatsBtn.onclick = hideStats;

    // Undo Choice
    const undoBtn = document.getElementById('player-undo-btn');
    if (undoBtn) {
      undoBtn.onclick = () => {
        const prev = this.engine.undo();
        if (prev) {
          this.currentStep = prev;
          this.render();
        }
      };
    }

    // Restart Game
    const restartBtn = document.getElementById('player-restart-btn');
    const stepRestartBtn = document.getElementById('step-restart-btn');
    const doRestart = () => {
      if (confirm('Restart this interactive story from the beginning?')) {
        this.currentStep = this.engine.restart();
        this.render();
      }
    };
    if (restartBtn) restartBtn.onclick = doRestart;
    if (stepRestartBtn) stepRestartBtn.onclick = doRestart;

    // Continue Page Break
    const continueBtn = document.getElementById('step-continue-btn');
    if (continueBtn) {
      continueBtn.onclick = () => {
        this.currentStep = this.engine.nextStep();
        this.render();
      };
    }

    // Choice Radio Selection & Confirm
    const radioInputs = document.querySelectorAll('input[name="cs-option"]');
    const confirmChoiceBtn = document.getElementById('step-confirm-choice-btn');

    radioInputs.forEach((radio) => {
      radio.onchange = () => {
        this.selectedOptionId = parseInt(radio.value);
        if (confirmChoiceBtn) {
          confirmChoiceBtn.removeAttribute('disabled');
          confirmChoiceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      };
    });

    if (confirmChoiceBtn) {
      confirmChoiceBtn.onclick = () => {
        if (this.selectedOptionId === null) return;
        const next = this.engine.makeChoice(this.selectedOptionId, this.currentStep.options);
        if (next) {
          this.currentStep = next;
          this.selectedOptionId = null;
          this.render();
        }
      };
    }
  }

  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.ChoiceScriptPlayer = ChoiceScriptPlayer;
