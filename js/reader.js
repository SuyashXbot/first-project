/**
 * Web Novel & Chapter Reader for TaleForge
 * Provides distraction-free typography, custom themes, font sizing,
 * scroll progress indicator, comments, and chapter navigation.
 */

class NovelReader {
  constructor(storage) {
    this.storage = storage;
    this.currentBook = null;
    this.currentChapter = null;
    this.initEvents();
  }

  initEvents() {
    window.addEventListener('scroll', () => {
      this.updateReadingProgress();
    });
  }

  loadChapter(bookId, chapterId) {
    const book = this.storage.getBookById(bookId);
    if (!book) {
      window.location.hash = '#library';
      return;
    }

    let chapter = null;
    if (chapterId) {
      chapter = book.chapters.find((c) => c.id === chapterId);
    }
    if (!chapter && book.chapters.length > 0) {
      chapter = book.chapters[0];
    }

    if (!chapter) {
      alert('This book does not have any chapters posted yet.');
      window.location.hash = `#book/${bookId}`;
      return;
    }

    this.currentBook = book;
    this.currentChapter = chapter;

    // Track on shelf
    this.storage.addToShelf(book.id, chapter.id);

    this.render();
  }

  render() {
    const container = document.getElementById('reader-view');
    if (!container) return;

    const book = this.currentBook;
    const chapter = this.currentChapter;
    const chapters = book.chapters;
    const currentIndex = chapters.findIndex((c) => c.id === chapter.id);

    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

    const settings = this.storage.readerSettings;
    const words = chapter.wordCount || chapter.content.split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 220));

    // Format paragraphs
    const formattedParagraphs = chapter.content
      .split(/\n\s*\n/)
      .map((p) => {
        const trimmed = p.trim();
        if (trimmed === '* * *' || trimmed === '***' || trimmed === '---') {
          return '<div class="scene-divider"><span>✦ ✦ ✦</span></div>';
        }
        return `<p>${this.formatChapterText(trimmed)}</p>`;
      })
      .join('');

    // Fetch comments for this chapter
    const comments = this.storage.getCommentsForChapter(chapter.id);

    container.innerHTML = `
      <!-- Reader Header Bar -->
      <div class="reader-header sticky top-0 z-30 transition-all duration-300">
        <div class="reader-progress-track">
          <div id="reader-progress-bar" class="reader-progress-fill" style="width: 0%"></div>
        </div>
        
        <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center space-x-3 overflow-hidden">
            <a href="#book/${book.id}" class="reader-nav-btn" title="Back to Book Overview">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </a>
            <div class="truncate">
              <div class="text-xs text-brand-muted truncate">${this.escapeHTML(book.title)}</div>
              <div class="text-sm font-semibold text-brand-light truncate">${this.escapeHTML(chapter.title)}</div>
            </div>
          </div>

          <!-- Reader Controls Toolbar -->
          <div class="flex items-center space-x-2">
            <!-- Table of contents dropdown toggle -->
            <button id="reader-toc-btn" class="reader-tool-btn" title="Table of Contents">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              <span class="hidden sm:inline text-xs ml-1 font-medium">Contents</span>
            </button>

            <!-- Typography & Theme Settings button -->
            <button id="reader-settings-btn" class="reader-tool-btn" title="Reading Settings">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              <span class="hidden sm:inline text-xs ml-1 font-medium">Display</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Dropdown Drawer -->
      <div id="reader-settings-panel" class="hidden max-w-4xl mx-auto px-4 py-4 mb-4 bg-brand-surface border border-brand-border rounded-xl shadow-2xl transition-all">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Font Size -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Font Size</label>
            <div class="flex items-center space-x-3">
              <button id="font-decrease-btn" class="btn-secondary px-3 py-1.5 text-sm rounded-lg">A-</button>
              <span id="font-size-indicator" class="text-sm font-medium text-brand-light">${settings.fontSize}px</span>
              <button id="font-increase-btn" class="btn-secondary px-3 py-1.5 text-sm rounded-lg">A+</button>
            </div>
          </div>

          <!-- Font Family -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Typography</label>
            <div class="flex items-center space-x-2">
              <button class="font-fam-btn ${settings.fontFamily === 'serif' ? 'active' : ''}" data-fam="serif">Serif</button>
              <button class="font-fam-btn ${settings.fontFamily === 'sans' ? 'active' : ''}" data-fam="sans">Sans</button>
              <button class="font-fam-btn ${settings.fontFamily === 'mono' ? 'active' : ''}" data-fam="mono">Mono</button>
            </div>
          </div>

          <!-- Theme -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Color Theme</label>
            <div class="flex items-center space-x-2">
              <button class="theme-swatch-btn ${settings.theme === 'dark' ? 'ring-2 ring-brand-primary' : ''} bg-slate-900 text-white" data-theme="dark" title="Midnight Dark">Dark</button>
              <button class="theme-swatch-btn ${settings.theme === 'sepia' ? 'ring-2 ring-amber-600' : ''} bg-[#fbf0d9] text-[#5f4b32]" data-theme="sepia" title="Warm Parchment">Sepia</button>
              <button class="theme-swatch-btn ${settings.theme === 'light' ? 'ring-2 ring-blue-600' : ''} bg-white text-slate-800" data-theme="light" title="Crisp Light">Light</button>
              <button class="theme-swatch-btn ${settings.theme === 'cyber' ? 'ring-2 ring-emerald-400' : ''} bg-[#0b1416] text-[#00ffcc]" data-theme="cyber" title="Cyber Emerald">Cyber</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table of Contents Drawer -->
      <div id="reader-toc-panel" class="hidden max-w-4xl mx-auto px-4 py-4 mb-4 bg-brand-surface border border-brand-border rounded-xl shadow-2xl">
        <h4 class="text-sm font-bold text-brand-light mb-3">All Chapters (${chapters.length})</h4>
        <div class="max-h-60 overflow-y-auto space-y-1 pr-2">
          ${chapters
            .map(
              (ch) => `
            <a href="#chapter/${book.id}/${ch.id}" class="toc-item flex items-center justify-between p-2.5 rounded-lg text-sm transition-all ${
                ch.id === chapter.id ? 'bg-brand-primary/20 text-brand-accent font-semibold' : 'text-brand-muted hover:bg-white/5 hover:text-brand-light'
              }">
              <span class="truncate">Chapter ${ch.number}: ${this.escapeHTML(ch.title)}</span>
              <span class="text-xs opacity-60 ml-2 whitespace-nowrap">${ch.wordCount || '~'} words</span>
            </a>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Main Reader Content Sheet -->
      <article id="reader-content-sheet" class="reader-sheet max-w-3xl mx-auto px-5 py-8 md:py-14 theme-${settings.theme} font-${settings.fontFamily}" style="font-size: ${settings.fontSize}px;">
        
        <!-- Chapter Header Title -->
        <header class="chapter-hero mb-8 pb-6 border-b border-white/10 text-center">
          <div class="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-2">Chapter ${chapter.number}</div>
          <h1 class="text-2xl md:text-4xl font-extrabold tracking-tight mb-4">${this.escapeHTML(chapter.title)}</h1>
          <div class="flex items-center justify-center space-x-4 text-xs text-brand-muted">
            <span>By ${this.escapeHTML(book.author)}</span>
            <span>•</span>
            <span>${words} words</span>
            <span>•</span>
            <span>~${readTimeMinutes} min read</span>
            <span>•</span>
            <span>${chapter.publishedAt}</span>
          </div>
        </header>

        <!-- Chapter Prose Body -->
        <div class="chapter-prose space-y-6 leading-relaxed">
          ${formattedParagraphs}
        </div>

        <!-- Chapter Footer Reactions & Navigation -->
        <footer class="mt-14 pt-8 border-t border-white/10">
          
          <!-- Reactions Bar -->
          <div class="chapter-reactions mb-10 text-center">
            <h4 class="text-sm font-semibold text-brand-muted mb-4">Did you enjoy this chapter?</h4>
            <div class="flex items-center justify-center space-x-3">
              <button class="reaction-btn" data-reaction="love">❤️ <span class="count">24</span></button>
              <button class="reaction-btn" data-reaction="epic">⚔️ <span class="count">18</span></button>
              <button class="reaction-btn" data-reaction="mindblown">🤯 <span class="count">12</span></button>
              <button class="reaction-btn" data-reaction="inspired">💡 <span class="count">7</span></button>
            </div>
          </div>

          <!-- Prev / Next Navigation -->
          <div class="chapter-nav-grid grid grid-cols-2 gap-4 my-8">
            ${
              prevChapter
                ? `
              <a href="#chapter/${book.id}/${prevChapter.id}" class="nav-chapter-card prev flex items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left group">
                <svg class="w-6 h-6 mr-3 text-brand-accent group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <div class="overflow-hidden">
                  <div class="text-xs text-brand-muted">Previous Chapter</div>
                  <div class="text-sm font-semibold text-brand-light truncate">Ch ${prevChapter.number}: ${this.escapeHTML(prevChapter.title)}</div>
                </div>
              </a>
            `
                : `<div></div>`
            }

            ${
              nextChapter
                ? `
              <a href="#chapter/${book.id}/${nextChapter.id}" class="nav-chapter-card next flex items-center justify-end p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-right group">
                <div class="overflow-hidden">
                  <div class="text-xs text-brand-muted">Next Chapter</div>
                  <div class="text-sm font-semibold text-brand-light truncate">Ch ${nextChapter.number}: ${this.escapeHTML(nextChapter.title)}</div>
                </div>
                <svg class="w-6 h-6 ml-3 text-brand-accent group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </a>
            `
                : `
              <div class="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-right">
                <div class="text-xs text-emerald-400 font-semibold uppercase">Latest Chapter Reached</div>
                <div class="text-sm text-brand-light">Stay tuned for future updates!</div>
              </div>
            `
            }
          </div>

          <!-- Chapter Comments Section -->
          <section id="chapter-comments-section" class="comments-section mt-12 pt-8 border-t border-white/10">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-brand-light flex items-center">
                <svg class="w-5 h-5 mr-2 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                Chapter Discussion (<span id="comments-count">${comments.length}</span>)
              </h3>
            </div>

            <!-- New Comment Box -->
            <form id="comment-form" class="mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
              <div class="mb-3">
                <input id="comment-author-input" type="text" placeholder="Your Reader Name / Handle" class="input-field text-sm" value="Reader" required />
              </div>
              <div class="mb-3">
                <textarea id="comment-text-input" rows="3" placeholder="Share your thoughts, theories, or reactions to this chapter..." class="input-field text-sm" required></textarea>
              </div>
              <div class="flex justify-end">
                <button type="submit" class="btn-primary text-sm px-5 py-2 rounded-lg flex items-center">
                  <span>Post Comment</span>
                  <svg class="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </div>
            </form>

            <!-- Comments List -->
            <div id="comments-container" class="space-y-4">
              ${
                comments.length === 0
                  ? `<div class="text-center py-6 text-brand-muted text-sm">No comments yet. Be the first to share your thoughts on this chapter!</div>`
                  : comments
                      .map(
                        (comm) => `
                    <div class="comment-card p-4 rounded-xl bg-white/5 border border-white/10" data-id="${comm.id}">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                          <div class="w-7 h-7 rounded-full bg-brand-primary/40 text-brand-accent flex items-center justify-center text-xs font-bold">${comm.avatar}</div>
                          <span class="text-sm font-semibold text-brand-light">${this.escapeHTML(comm.author)}</span>
                          <span class="text-xs text-brand-muted">• ${comm.date}</span>
                        </div>
                        <button class="like-comment-btn text-xs text-brand-muted hover:text-brand-accent flex items-center space-x-1" data-id="${comm.id}">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                          <span class="like-count">${comm.likes || 0}</span>
                        </button>
                      </div>
                      <p class="text-sm text-brand-light/90 leading-relaxed">${this.escapeHTML(comm.text)}</p>
                    </div>
                  `
                      )
                      .join('')
              }
            </div>
          </section>

        </footer>
      </article>
    `;

    this.bindReaderControls();
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.updateReadingProgress();
  }

  bindReaderControls() {
    const settingsPanel = document.getElementById('reader-settings-panel');
    const tocPanel = document.getElementById('reader-toc-panel');
    const settingsBtn = document.getElementById('reader-settings-btn');
    const tocBtn = document.getElementById('reader-toc-btn');

    if (settingsBtn) {
      settingsBtn.onclick = () => {
        settingsPanel?.classList.toggle('hidden');
        tocPanel?.classList.add('hidden');
      };
    }

    if (tocBtn) {
      tocBtn.onclick = () => {
        tocPanel?.classList.toggle('hidden');
        settingsPanel?.classList.add('hidden');
      };
    }

    // Font size controls
    const sheet = document.getElementById('reader-content-sheet');
    const fontInc = document.getElementById('font-increase-btn');
    const fontDec = document.getElementById('font-decrease-btn');
    const fontInd = document.getElementById('font-size-indicator');

    if (fontInc && fontDec && sheet) {
      fontInc.onclick = () => {
        let size = this.storage.readerSettings.fontSize + 2;
        if (size > 32) size = 32;
        this.applyFontSize(size, sheet, fontInd);
      };
      fontDec.onclick = () => {
        let size = this.storage.readerSettings.fontSize - 2;
        if (size < 14) size = 14;
        this.applyFontSize(size, sheet, fontInd);
      };
    }

    // Font family controls
    const famBtns = document.querySelectorAll('.font-fam-btn');
    famBtns.forEach((btn) => {
      btn.onclick = () => {
        const fam = btn.getAttribute('data-fam');
        famBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        if (sheet) {
          sheet.classList.remove('font-serif', 'font-sans', 'font-mono');
          sheet.classList.add(`font-${fam}`);
        }
        this.storage.saveReaderSettings({ fontFamily: fam });
      };
    });

    // Theme swatch controls
    const themeBtns = document.querySelectorAll('.theme-swatch-btn');
    themeBtns.forEach((btn) => {
      btn.onclick = () => {
        const theme = btn.getAttribute('data-theme');
        themeBtns.forEach((b) => b.classList.remove('ring-2'));
        btn.classList.add('ring-2');
        if (sheet) {
          sheet.classList.remove('theme-dark', 'theme-light', 'theme-sepia', 'theme-cyber');
          sheet.classList.add(`theme-${theme}`);
        }
        this.storage.saveReaderSettings({ theme });
      };
    });

    // Reaction clicks
    const reactionBtns = document.querySelectorAll('.reaction-btn');
    reactionBtns.forEach((btn) => {
      btn.onclick = () => {
        const countSpan = btn.querySelector('.count');
        if (countSpan && !btn.classList.contains('reacted')) {
          countSpan.textContent = parseInt(countSpan.textContent) + 1;
          btn.classList.add('reacted', 'bg-brand-primary/30', 'border-brand-primary');
        }
      };
    });

    // Comment submission
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.onsubmit = (e) => {
        e.preventDefault();
        const authorInput = document.getElementById('comment-author-input');
        const textInput = document.getElementById('comment-text-input');
        if (!textInput.value.trim()) return;

        const newComm = this.storage.addComment(this.currentChapter.id, authorInput.value, textInput.value);
        textInput.value = '';

        // Prepend comment card
        const container = document.getElementById('comments-container');
        if (container) {
          const emptyNotice = container.querySelector('.text-center');
          if (emptyNotice) emptyNotice.remove();

          const card = document.createElement('div');
          card.className = 'comment-card p-4 rounded-xl bg-white/5 border border-white/10 animate-fade-in';
          card.innerHTML = `
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-7 h-7 rounded-full bg-brand-primary/40 text-brand-accent flex items-center justify-center text-xs font-bold">${newComm.avatar}</div>
                <span class="text-sm font-semibold text-brand-light">${this.escapeHTML(newComm.author)}</span>
                <span class="text-xs text-brand-muted">• ${newComm.date}</span>
              </div>
              <span class="text-xs text-brand-muted">0 likes</span>
            </div>
            <p class="text-sm text-brand-light/90 leading-relaxed">${this.escapeHTML(newComm.text)}</p>
          `;
          container.prepend(card);

          const countSpan = document.getElementById('comments-count');
          if (countSpan) {
            countSpan.textContent = parseInt(countSpan.textContent || '0') + 1;
          }
        }
      };
    }

    // Like comment buttons
    const commentsContainer = document.getElementById('comments-container');
    if (commentsContainer) {
      commentsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.like-comment-btn');
        if (btn && !btn.classList.contains('liked')) {
          const commId = btn.getAttribute('data-id');
          const newLikes = this.storage.likeComment(this.currentChapter.id, commId);
          const countSpan = btn.querySelector('.like-count');
          if (countSpan) countSpan.textContent = newLikes;
          btn.classList.add('liked', 'text-brand-accent');
        }
      });
    }
  }

  applyFontSize(size, sheet, indicator) {
    sheet.style.fontSize = `${size}px`;
    if (indicator) indicator.textContent = `${size}px`;
    this.storage.saveReaderSettings({ fontSize: size });
  }

  updateReadingProgress() {
    const progressBar = document.getElementById('reader-progress-bar');
    if (!progressBar) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      progressBar.style.width = '100%';
      return;
    }

    const percent = Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)));
    progressBar.style.width = `${percent}%`;
  }

  formatChapterText(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
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

window.NovelReader = NovelReader;
