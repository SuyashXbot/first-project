/**
 * TaleForge App Controller & Router
 * Manages views, search, library browsing, book details,
 * shelf management, and route dispatching.
 */

class TaleForgeApp {
  constructor() {
    this.storage = window.TaleForgeStorage;
    this.reader = new window.NovelReader(this.storage);
    this.player = new window.ChoiceScriptPlayer(this.storage);
    this.studio = new window.AuthorStudio(this.storage);

    this.activeFilter = 'all'; // 'all', 'choicescript', 'novel', or genre name
    this.searchQuery = '';

    this.init();
  }

  init() {
    this.bindGlobalNavigation();
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  bindGlobalNavigation() {
    // Mobile navigation toggling
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.onclick = () => {
        mobileMenu.classList.toggle('hidden');
      };
    }

    // Close mobile menu on link click
    document.querySelectorAll('#mobile-menu a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu?.classList.add('hidden');
      });
    });

    // Search input
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (window.location.hash.startsWith('#library') || window.location.hash === '' || window.location.hash === '#games' || window.location.hash === '#novels') {
          this.renderLibrary();
        }
      });
    }
  }

  handleRoute() {
    const hash = window.location.hash || '#library';
    const parts = hash.substring(1).split('/');
    const route = parts[0];

    // Hide all main view containers
    const views = ['library-view', 'book-details-view', 'reader-view', 'player-view', 'studio-view', 'shelf-view'];
    views.forEach((v) => {
      const el = document.getElementById(v);
      if (el) el.classList.add('hidden');
    });

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === hash || (route === 'library' && href === '#library')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Route dispatch
    if (route === 'library' || route === '') {
      this.activeFilter = 'all';
      this.showView('library-view');
      this.renderLibrary();
    } else if (route === 'games') {
      this.activeFilter = 'choicescript';
      this.showView('library-view');
      this.renderLibrary();
    } else if (route === 'novels') {
      this.activeFilter = 'novel';
      this.showView('library-view');
      this.renderLibrary();
    } else if (route === 'book') {
      const bookId = parts[1];
      this.showView('book-details-view');
      this.renderBookDetails(bookId);
    } else if (route === 'chapter') {
      const bookId = parts[1];
      const chapterId = parts[2];
      this.showView('reader-view');
      this.reader.loadChapter(bookId, chapterId);
    } else if (route === 'play') {
      const gameId = parts[1];
      this.showView('player-view');
      this.player.loadGame(gameId);
    } else if (route === 'studio') {
      this.showView('studio-view');
      this.studio.render();
    } else if (route === 'shelf') {
      this.showView('shelf-view');
      this.renderShelf();
    } else {
      this.showView('library-view');
      this.renderLibrary();
    }

    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  showView(viewId) {
    const el = document.getElementById(viewId);
    if (el) el.classList.remove('hidden');
  }

  // --- View: Library / Catalog ---

  renderLibrary() {
    const container = document.getElementById('library-view');
    if (!container) return;

    let items = this.storage.getAllItems();

    // Filter by type or genre
    if (this.activeFilter === 'choicescript') {
      items = items.filter((item) => item.type === 'choicescript');
    } else if (this.activeFilter === 'novel') {
      items = items.filter((item) => item.type === 'novel');
    } else if (this.activeFilter !== 'all') {
      items = items.filter((item) => item.genre.toLowerCase() === this.activeFilter.toLowerCase());
    }

    // Filter by search query
    if (this.searchQuery) {
      items = items.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(this.searchQuery);
        const authorMatch = item.author.toLowerCase().includes(this.searchQuery);
        const genreMatch = item.genre.toLowerCase().includes(this.searchQuery);
        const tagMatch = item.tags && item.tags.some((t) => t.toLowerCase().includes(this.searchQuery));
        return titleMatch || authorMatch || genreMatch || tagMatch;
      });
    }

    // Featured Hero item
    const featured = this.storage.games[0] || this.storage.books[0];

    container.innerHTML = `
      <!-- Featured Hero Banner (shown on main library) -->
      ${
        this.activeFilter === 'all' && !this.searchQuery
          ? `
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-950/80 to-slate-900 border border-brand-border p-6 md:p-12 mb-10 shadow-2xl">
          <div class="absolute -right-10 -bottom-10 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10 max-w-2xl space-y-4">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-accent/20 border border-brand-accent/30 text-brand-accent text-xs font-bold uppercase tracking-wider">
              <span>✦ Featured Interactive Story</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              ${this.escapeHTML(featured.title)}
            </h1>
            <p class="text-brand-muted text-sm md:text-base leading-relaxed line-clamp-3">
              ${this.escapeHTML(featured.synopsis)}
            </p>
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a href="#play/${featured.id}" class="btn-primary px-6 py-3 rounded-xl font-bold flex items-center shadow-lg hover:scale-105 transition-transform">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
                <span>Play ChoiceScript Game</span>
              </a>
              <a href="#studio" class="btn-secondary px-5 py-3 rounded-xl font-semibold flex items-center">
                <svg class="w-5 h-5 mr-2 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                <span>Post Chapter / Create</span>
              </a>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- Filter Controls & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-brand-light flex items-center">
            <span>${this.getFilterTitle()}</span>
            <span class="text-xs ml-3 px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-accent font-semibold">${items.length} titles</span>
          </h2>
        </div>

        <!-- Filter Pills -->
        <div class="flex flex-wrap items-center gap-2">
          <button class="filter-pill ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
          <button class="filter-pill ${this.activeFilter === 'choicescript' ? 'active' : ''}" data-filter="choicescript">🎮 ChoiceScript Games</button>
          <button class="filter-pill ${this.activeFilter === 'novel' ? 'active' : ''}" data-filter="novel">📖 Web Novels</button>
          <button class="filter-pill ${this.activeFilter === 'Epic Fantasy' ? 'active' : ''}" data-filter="Epic Fantasy">Fantasy</button>
          <button class="filter-pill ${this.activeFilter === 'Sci-Fi' ? 'active' : ''}" data-filter="Sci-Fi">Sci-Fi</button>
        </div>
      </div>

      <!-- Library Grid -->
      ${
        items.length === 0
          ? `
        <div class="text-center py-16 card p-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-brand-muted">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-brand-light mb-1">No stories found</h3>
          <p class="text-sm text-brand-muted mb-4">Try clearing your search query or filter, or post your own story in the studio!</p>
          <a href="#studio" class="btn-primary text-xs px-4 py-2 rounded-xl inline-flex items-center">
            <span>Open Creator Studio</span>
          </a>
        </div>
      `
          : `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${items.map((item) => this.renderBookCard(item)).join('')}
        </div>
      `
      }
    `;

    this.bindLibraryEvents();
  }

  getFilterTitle() {
    if (this.searchQuery) return `Search Results for "${this.searchQuery}"`;
    if (this.activeFilter === 'choicescript') return 'ChoiceScript Interactive Games';
    if (this.activeFilter === 'novel') return 'Serialized Web Novels & Chapters';
    if (this.activeFilter !== 'all') return `${this.activeFilter} Stories`;
    return 'Browse Stories & Games';
  }

  renderBookCard(item) {
    const isGame = item.type === 'choicescript';
    const linkHref = isGame ? `#play/${item.id}` : `#book/${item.id}`;
    const chapterCount = item.chapters ? item.chapters.length : null;

    return `
      <div class="book-card card group flex flex-col justify-between overflow-hidden hover:border-brand-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-lg">
        <div>
          <!-- Book Cover Graphic -->
          <a href="${linkHref}" class="block relative h-48 bg-gradient-to-br ${item.coverColor || 'from-indigo-900 to-slate-900'} p-6 flex flex-col justify-between overflow-hidden">
            <div class="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform">
              ${this.getCoverIconSVG(item.coverIcon || (isGame ? 'dice' : 'book'))}
            </div>

            <div class="flex items-center justify-between z-10">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isGame ? 'bg-purple-500/30 text-purple-200 border border-purple-400/30' : 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
              }">
                ${isGame ? '🎮 Interactive Game' : '📖 Web Novel'}
              </span>
              <span class="text-xs text-brand-light font-semibold bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                ★ ${item.rating || '4.9'}
              </span>
            </div>

            <div class="z-10">
              <h3 class="text-xl font-extrabold text-white leading-snug drop-shadow-md group-hover:text-brand-accent transition-colors line-clamp-2">
                ${this.escapeHTML(item.title)}
              </h3>
              <p class="text-xs text-white/80 font-medium mt-1">By ${this.escapeHTML(item.author)}</p>
            </div>
          </a>

          <!-- Details & Synopsis -->
          <div class="p-5 space-y-3">
            <div class="flex items-center justify-between text-xs text-brand-muted">
              <span>${item.genre}</span>
              <span>${isGame ? 'Multiple Endings' : `${chapterCount} Chapters`}</span>
            </div>

            <p class="text-xs text-brand-muted/90 line-clamp-3 leading-relaxed">
              ${this.escapeHTML(item.synopsis)}
            </p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              ${(item.tags || [])
                .slice(0, 3)
                .map(
                  (tag) => `
                <span class="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-brand-muted border border-white/5">${tag}</span>
              `
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="px-5 pb-5 pt-2 border-t border-white/5 flex items-center justify-between">
          <a href="${linkHref}" class="${isGame ? 'btn-primary' : 'btn-secondary'} text-xs px-4 py-2 rounded-xl font-bold flex items-center">
            ${
              isGame
                ? `<span>Play Game</span><svg class="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>`
                : `<span>Read Novel</span><svg class="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`
            }
          </a>

          <button class="bookmark-btn text-brand-muted hover:text-brand-accent p-2 rounded-lg transition-colors" data-id="${item.id}" title="Bookmark to My Shelf">
            <svg class="w-5 h-5 ${this.storage.isInShelf(item.id) ? 'text-brand-accent fill-brand-accent' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
          </button>
        </div>
      </div>
    `;
  }

  bindLibraryEvents() {
    // Filter pills
    document.querySelectorAll('.filter-pill').forEach((btn) => {
      btn.onclick = () => {
        this.activeFilter = btn.getAttribute('data-filter');
        this.renderLibrary();
      };
    });

    // Bookmark buttons
    document.querySelectorAll('.bookmark-btn').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const itemId = btn.getAttribute('data-id');
        if (this.storage.isInShelf(itemId)) {
          this.storage.removeFromShelf(itemId);
        } else {
          this.storage.addToShelf(itemId);
        }
        this.renderLibrary();
      };
    });
  }

  // --- View: Book Details & Chapter Index ---

  renderBookDetails(bookId) {
    const container = document.getElementById('book-details-view');
    if (!container) return;

    const book = this.storage.getBookById(bookId);
    if (!book) {
      window.location.hash = '#library';
      return;
    }

    const firstChapter = book.chapters && book.chapters.length > 0 ? book.chapters[0] : null;
    const totalWords = book.chapters ? book.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0) : 0;

    container.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        <!-- Breadcrumbs -->
        <div class="flex items-center space-x-2 text-xs text-brand-muted">
          <a href="#library" class="hover:text-brand-light">Library</a>
          <span>/</span>
          <a href="#novels" class="hover:text-brand-light">${book.genre}</a>
          <span>/</span>
          <span class="text-brand-light font-medium truncate">${this.escapeHTML(book.title)}</span>
        </div>

        <!-- Book Header Banner -->
        <div class="card p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
          
          <!-- Large Cover Art -->
          <div class="w-full md:w-56 h-72 rounded-2xl bg-gradient-to-br ${book.coverColor || 'from-indigo-900 to-slate-900'} p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden flex-shrink-0">
            <div class="absolute -right-6 -bottom-6 opacity-25">
              ${this.getCoverIconSVG(book.coverIcon || 'book')}
            </div>
            <div class="text-xs uppercase font-bold tracking-widest text-white/70">${book.genre}</div>
            <div>
              <h2 class="text-2xl font-black text-white leading-tight drop-shadow">${this.escapeHTML(book.title)}</h2>
              <div class="text-xs text-white/80 mt-1 font-semibold">${this.escapeHTML(book.author)}</div>
            </div>
          </div>

          <!-- Metadata & Actions -->
          <div class="flex-1 space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-primary/20 text-brand-accent border border-brand-primary/40">${book.genre}</span>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">${book.status || 'Ongoing'}</span>
              <span class="text-xs text-brand-muted">★ ${book.rating} (${book.views || '1.2K'} reads)</span>
            </div>

            <h1 class="text-2xl md:text-3xl font-extrabold text-brand-light">${this.escapeHTML(book.title)}</h1>
            <p class="text-xs text-brand-muted">Written by <span class="text-brand-light font-semibold">${this.escapeHTML(book.author)}</span></p>

            <p class="text-sm text-brand-light/90 leading-relaxed">${this.escapeHTML(book.synopsis)}</p>

            <div class="flex flex-wrap items-center gap-4 text-xs text-brand-muted pt-2 border-t border-brand-border">
              <span><strong>${book.chapters.length}</strong> Chapters</span>
              <span>•</span>
              <span><strong>${totalWords.toLocaleString()}</strong> Total Words</span>
              <span>•</span>
              <span>Updated recently</span>
            </div>

            <!-- Primary CTAs -->
            <div class="flex flex-wrap items-center gap-3 pt-3">
              ${
                firstChapter
                  ? `
                <a href="#chapter/${book.id}/${firstChapter.id}" class="btn-primary px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  <span>Start Reading Chapter 1</span>
                </a>
              `
                  : ''
              }

              <a href="#studio" class="btn-secondary px-5 py-2.5 rounded-xl font-semibold flex items-center">
                <svg class="w-4 h-4 mr-2 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                <span>Post Next Chapter</span>
              </a>

              <button id="book-shelf-toggle" class="btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center">
                <svg class="w-4 h-4 mr-1.5 ${this.storage.isInShelf(book.id) ? 'text-brand-accent fill-brand-accent' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                <span>${this.storage.isInShelf(book.id) ? 'Saved on Shelf' : 'Add to Shelf'}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Table of Contents Section -->
        <div class="card p-6 md:p-8">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
            <h3 class="text-lg font-bold text-brand-light flex items-center">
              <svg class="w-5 h-5 mr-2 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              <span>Table of Contents (${book.chapters.length})</span>
            </h3>
            <a href="#studio" class="text-xs text-brand-accent hover:underline font-semibold">+ Add Chapter</a>
          </div>

          <div class="space-y-3">
            ${
              book.chapters.length === 0
                ? `<div class="text-center py-8 text-brand-muted text-sm">No chapters posted yet. Tap "+ Add Chapter" above to publish chapter 1!</div>`
                : book.chapters
                    .map(
                      (ch) => `
                <a href="#chapter/${book.id}/${ch.id}" class="chapter-list-item flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-primary/40 hover:bg-white/10 transition-all group">
                  <div class="flex items-center space-x-3 overflow-hidden">
                    <span class="w-7 h-7 rounded-lg bg-brand-primary/20 text-brand-accent flex items-center justify-center text-xs font-bold flex-shrink-0">${ch.number}</span>
                    <span class="text-sm font-semibold text-brand-light group-hover:text-brand-accent transition-colors truncate">${this.escapeHTML(ch.title)}</span>
                  </div>
                  <div class="flex items-center space-x-4 text-xs text-brand-muted flex-shrink-0 ml-4">
                    <span>${ch.wordCount || '~'} words</span>
                    <span>${ch.publishedAt}</span>
                    <svg class="w-4 h-4 text-brand-accent group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </a>
              `
                    )
                    .join('')
            }
          </div>
        </div>

      </div>
    `;

    const shelfBtn = document.getElementById('book-shelf-toggle');
    if (shelfBtn) {
      shelfBtn.onclick = () => {
        if (this.storage.isInShelf(book.id)) {
          this.storage.removeFromShelf(book.id);
        } else {
          this.storage.addToShelf(book.id);
        }
        this.renderBookDetails(book.id);
      };
    }
  }

  // --- View: My Shelf / Bookmarks ---

  renderShelf() {
    const container = document.getElementById('shelf-view');
    if (!container) return;

    const shelfEntries = this.storage.shelf;
    const items = shelfEntries
      .map((entry) => {
        const item = this.storage.getItemById(entry.itemId);
        return item ? { ...item, shelfEntry: entry } : null;
      })
      .filter(Boolean);

    container.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold text-brand-light">My Bookshelf</h1>
          <p class="text-sm text-brand-muted mt-1">Pick up right where you left off in your stories and games.</p>
        </div>

        ${
          items.length === 0
            ? `
          <div class="card p-12 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-brand-muted">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-brand-light mb-1">Your shelf is empty</h3>
            <p class="text-sm text-brand-muted mb-6">Explore the library and tap the bookmark icon to save books and interactive games here.</p>
            <a href="#library" class="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold inline-flex items-center">
              <span>Browse Catalog</span>
            </a>
          </div>
        `
            : `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${items.map((item) => this.renderBookCard(item)).join('')}
          </div>
        `
        }
      </div>
    `;

    this.bindLibraryEvents();
  }

  getCoverIconSVG(iconName) {
    if (iconName === 'sword') {
      return `<svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19.707 4.293a1 1 0 00-1.414 0l-8.586 8.586-2.293-2.293a1 1 0 00-1.414 1.414l2.293 2.293-4.586 4.586a1 1 0 001.414 1.414l4.586-4.586 2.293 2.293a1 1 0 001.414-1.414l-2.293-2.293 8.586-8.586a1 1 0 000-1.414z"/></svg>`;
    }
    if (iconName === 'gear') {
      return `<svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clip-rule="evenodd"/></svg>`;
    }
    if (iconName === 'dice') {
      return `<svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0-9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4.5 4.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4.5 4.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0-9a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>`;
    }
    return `<svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>`;
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

document.addEventListener('DOMContentLoaded', () => {
  window.app = new TaleForgeApp();
});
