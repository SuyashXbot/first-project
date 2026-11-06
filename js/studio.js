/**
 * Author Studio & Publisher for TaleForge
 * Allows users to post chapters to existing books, create new novels,
 * write or upload ChoiceScript games with live test execution, and manage backups.
 */

class AuthorStudio {
  constructor(storage, onPublishCallback) {
    this.storage = storage;
    this.onPublishCallback = onPublishCallback || null;
    this.activeTab = 'post-chapter'; // 'post-chapter', 'create-book', 'create-choicescript', 'backups'
    this.testEngine = null;
  }

  render() {
    const container = document.getElementById('studio-view');
    if (!container) return;

    const books = this.storage.books;

    container.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 py-8">
        
        <!-- Studio Header -->
        <div class="studio-header mb-8">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-accent mb-1">
                <span class="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                <span>Creator Studio</span>
              </div>
              <h1 class="text-3xl font-extrabold text-brand-light">Author & Game Studio</h1>
              <p class="text-sm text-brand-muted mt-1">Post new chapters to serialized novels, publish books, or host interactive ChoiceScript games.</p>
            </div>
            
            <!-- Quick Actions -->
            <div class="flex items-center space-x-3">
              <a href="#library" class="btn-secondary text-sm px-4 py-2 rounded-xl flex items-center">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span>Back to Library</span>
              </a>
            </div>
          </div>

          <!-- Studio Navigation Tabs -->
          <div class="flex border-b border-brand-border mt-8 overflow-x-auto space-x-2 pb-px">
            <button class="studio-tab-btn ${this.activeTab === 'post-chapter' ? 'active' : ''}" data-tab="post-chapter">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              <span>Post New Chapter</span>
            </button>
            <button class="studio-tab-btn ${this.activeTab === 'create-book' ? 'active' : ''}" data-tab="create-book">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Create New Book</span>
            </button>
            <button class="studio-tab-btn ${this.activeTab === 'create-choicescript' ? 'active' : ''}" data-tab="create-choicescript">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Host ChoiceScript Game</span>
            </button>
            <button class="studio-tab-btn ${this.activeTab === 'backups' ? 'active' : ''}" data-tab="backups">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <span>Export & Backup</span>
            </button>
          </div>
        </div>

        <!-- Tab 1: Post New Chapter -->
        <div id="tab-post-chapter" class="studio-tab-pane ${this.activeTab === 'post-chapter' ? '' : 'hidden'}">
          <div class="card p-6 md:p-8">
            <h2 class="text-xl font-bold text-brand-light mb-4 flex items-center">
              <span>Post Chapter to Book</span>
            </h2>

            <form id="form-post-chapter" class="space-y-6">
              <!-- Select Target Book -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Select Book</label>
                <select id="chapter-book-select" class="input-field text-sm" required>
                  ${books
                    .map(
                      (b) => `
                    <option value="${b.id}">${this.escapeHTML(b.title)} (${b.chapters.length} chapters published)</option>
                  `
                    )
                    .join('')}
                </select>
              </div>

              <!-- Chapter Title & Number -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="md:col-span-1">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Chapter #</label>
                  <input id="chapter-num-input" type="number" min="1" class="input-field text-sm" placeholder="Auto" />
                </div>
                <div class="md:col-span-3">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Chapter Title</label>
                  <input id="chapter-title-input" type="text" class="input-field text-sm" placeholder="e.g. The Gathering of Shadows" required />
                </div>
              </div>

              <!-- Chapter Body -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted">Chapter Content</label>
                  <span id="chapter-word-count" class="text-xs text-brand-muted">0 words</span>
                </div>
                <textarea id="chapter-body-input" rows="14" class="input-field font-serif text-sm leading-relaxed" placeholder="Type or paste your chapter prose here...

Use blank lines to separate paragraphs.
Use * * * on its own line for scene breaks.
Markdown formatting like **bold** and *italic* is supported." required></textarea>
              </div>

              <!-- Submit -->
              <div class="flex items-center justify-end space-x-4 pt-4 border-t border-brand-border">
                <button type="submit" class="btn-primary px-6 py-2.5 rounded-xl font-semibold flex items-center shadow-lg">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Publish Chapter</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Tab 2: Create New Book -->
        <div id="tab-create-book" class="studio-tab-pane ${this.activeTab === 'create-book' ? '' : 'hidden'}">
          <div class="card p-6 md:p-8">
            <h2 class="text-xl font-bold text-brand-light mb-4">Create New Serialized Novel</h2>
            <form id="form-create-book" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Book Title</label>
                  <input id="new-book-title" type="text" class="input-field text-sm" placeholder="e.g. The Alchemist of Glass" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Author Name / Pen Name</label>
                  <input id="new-book-author" type="text" class="input-field text-sm" placeholder="e.g. Elena Vance" required />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Genre</label>
                  <select id="new-book-genre" class="input-field text-sm">
                    <option value="Epic Fantasy">Epic Fantasy</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Steampunk Mystery">Steampunk Mystery</option>
                    <option value="Dark Fantasy">Dark Fantasy</option>
                    <option value="Cyberpunk">Cyberpunk</option>
                    <option value="LitRPG / Progression">LitRPG / Progression</option>
                    <option value="Romance & Drama">Romance & Drama</option>
                    <option value="Slice of Life">Slice of Life</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Cover Color Gradient</label>
                  <select id="new-book-cover" class="input-field text-sm">
                    <option value="from-amber-600 via-orange-700 to-slate-900">Solar Gold & Amber</option>
                    <option value="from-indigo-600 via-purple-700 to-slate-900">Mystic Purple & Indigo</option>
                    <option value="from-emerald-700 via-teal-800 to-slate-900">Emerald Forest & Jade</option>
                    <option value="from-rose-600 via-pink-700 to-slate-900">Crimson & Rose</option>
                    <option value="from-cyan-700 via-sky-800 to-indigo-950">Deep Ocean & Sky</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Synopsis / Blurb</label>
                <textarea id="new-book-synopsis" rows="4" class="input-field text-sm leading-relaxed" placeholder="Describe the premise, stakes, and hooks of your story to captivate readers..." required></textarea>
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Tags (Comma-separated)</label>
                <input id="new-book-tags" type="text" class="input-field text-sm" placeholder="e.g. Fantasy, Magic, Adventure, Royalty" />
              </div>

              <!-- First Chapter (Optional) -->
              <div class="border-t border-brand-border pt-6">
                <h3 class="text-sm font-bold text-brand-light mb-3">Initial Chapter (Optional)</h3>
                <div class="space-y-4">
                  <input id="new-book-ch1-title" type="text" class="input-field text-sm" placeholder="Chapter 1 Title (e.g. The Ember Awakes)" />
                  <textarea id="new-book-ch1-content" rows="6" class="input-field font-serif text-sm leading-relaxed" placeholder="Paste Chapter 1 content here (can also be added later)..."></textarea>
                </div>
              </div>

              <div class="flex items-center justify-end space-x-4 pt-4 border-t border-brand-border">
                <button type="submit" class="btn-primary px-6 py-2.5 rounded-xl font-semibold flex items-center shadow-lg">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  <span>Publish New Book</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Tab 3: ChoiceScript Game Studio -->
        <div id="tab-create-choicescript" class="studio-tab-pane ${this.activeTab === 'create-choicescript' ? '' : 'hidden'}">
          <div class="card p-6 md:p-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 class="text-xl font-bold text-brand-light">Host a ChoiceScript Game</h2>
                <p class="text-xs text-brand-muted mt-1">Write an interactive branching story in ChoiceScript, or upload a .txt script file directly.</p>
              </div>
              <div class="flex items-center space-x-3">
                <!-- File Upload Trigger -->
                <label class="btn-secondary text-xs px-3.5 py-2 rounded-xl cursor-pointer flex items-center">
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  <span>Upload .txt Script</span>
                  <input id="cs-file-upload" type="file" accept=".txt,.cs" class="hidden" />
                </label>
              </div>
            </div>

            <!-- ChoiceScript Quick Syntax Insert Toolbar -->
            <div class="flex flex-wrap items-center gap-2 mb-3 p-3 bg-brand-surface rounded-xl border border-brand-border text-xs">
              <span class="text-brand-muted font-semibold mr-1">Insert Syntax:</span>
              <button class="cs-quick-insert btn-secondary px-2.5 py-1 rounded" data-snippet="*choice\n  #First option label\n    You chose the first path.\n    *goto next_scene\n  #Second option label\n    You chose the second path.\n    *goto next_scene">*choice</button>
              <button class="cs-quick-insert btn-secondary px-2.5 py-1 rounded" data-snippet="*create health 100\n*create gold 50\n*create character_name &quot;Hero&quot;">*create vars</button>
              <button class="cs-quick-insert btn-secondary px-2.5 py-1 rounded" data-snippet="*set health - 20\n*set gold + 10">*set math</button>
              <button class="cs-quick-insert btn-secondary px-2.5 py-1 rounded" data-snippet="*if (health > 50)\n  You are still standing strong!\n*else\n  Your breath comes in ragged gasps!">*if / *else</button>
              <button class="cs-quick-insert btn-secondary px-2.5 py-1 rounded" data-snippet="*stat_chart\n  text character_name Name\n  percent health Health\n  text gold Gold">*stat_chart</button>
              <button class="cs-quick-insert btn-secondary px-2.5 py-1 rounded" data-snippet="*page_break Continue on">*page_break</button>
            </div>

            <form id="form-create-choicescript" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Game Title</label>
                  <input id="cs-title-input" type="text" class="input-field text-sm" placeholder="e.g. Escape from Sorcerer's Isle" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Author Name</label>
                  <input id="cs-author-input" type="text" class="input-field text-sm" placeholder="e.g. Kaelen Vance" required />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Synopsis</label>
                <textarea id="cs-synopsis-input" rows="2" class="input-field text-sm" placeholder="Brief summary of the interactive adventure and choices..." required></textarea>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-brand-muted">ChoiceScript Code (.txt)</label>
                  <button type="button" id="cs-test-run-btn" class="text-xs text-brand-accent hover:underline flex items-center font-medium">
                    <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
                    <span>Test Script Live in Sandbox</span>
                  </button>
                </div>
                <textarea id="cs-code-input" rows="16" class="input-field font-mono text-xs leading-relaxed" placeholder="*title Escape from Sorcerer's Isle
*author Anonymous
*scene_list
  startup

*create health 100
*create mana 50

You awaken on a storm-swept beach of obsidian glass.

*choice
  #Search the flotsam for a weapon.
    You discover an ancient flintlock pistol!
    *set health + 10
    *finish
  #Head straight into the whispering jungle.
    Thorns scratch your cloak, but your resolve remains unbent.
    *finish" required></textarea>
              </div>

              <!-- Live Test Sandbox Drawer (collapsible) -->
              <div id="cs-test-sandbox" class="hidden p-4 rounded-xl bg-slate-950 border border-brand-accent/40 my-4">
                <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <span class="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping"></span>
                    Live Test Execution
                  </span>
                  <button type="button" id="cs-close-test-btn" class="text-xs text-brand-muted hover:text-white">✕ Close Test</button>
                </div>
                <div id="cs-sandbox-output" class="text-sm space-y-4"></div>
              </div>

              <div class="flex items-center justify-end space-x-4 pt-4 border-t border-brand-border">
                <button type="submit" class="btn-primary px-6 py-2.5 rounded-xl font-semibold flex items-center shadow-lg">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Publish ChoiceScript Game</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Tab 4: Backups & Data Management -->
        <div id="tab-backups" class="studio-tab-pane ${this.activeTab === 'backups' ? '' : 'hidden'}">
          <div class="card p-6 md:p-8 space-y-8">
            <div>
              <h2 class="text-xl font-bold text-brand-light mb-2">Export & Backups</h2>
              <p class="text-sm text-brand-muted">Download all your books, custom chapters, comments, and games as a portable JSON file, or restore from a backup.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Export Card -->
              <div class="p-5 rounded-2xl bg-white/5 border border-brand-border space-y-4">
                <div class="w-10 h-10 rounded-xl bg-brand-primary/30 text-brand-accent flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </div>
                <h3 class="text-base font-bold text-brand-light">Export Everything</h3>
                <p class="text-xs text-brand-muted">Saves all novels, chapters, ChoiceScript scripts, and comments as a single JSON file to your device.</p>
                <button id="export-json-btn" class="btn-primary text-xs px-4 py-2.5 rounded-xl w-full flex items-center justify-center">
                  <span>Download Backup File</span>
                </button>
              </div>

              <!-- Import Card -->
              <div class="p-5 rounded-2xl bg-white/5 border border-brand-border space-y-4">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                </div>
                <h3 class="text-base font-bold text-brand-light">Restore from Backup</h3>
                <p class="text-xs text-brand-muted">Select a previously downloaded TaleForge JSON file to restore your entire library.</p>
                <label class="btn-secondary text-xs px-4 py-2.5 rounded-xl w-full flex items-center justify-center cursor-pointer">
                  <span>Choose JSON File to Restore</span>
                  <input id="import-json-file" type="file" accept=".json" class="hidden" />
                </label>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="pt-6 border-t border-red-500/20">
              <h3 class="text-sm font-bold text-red-400 mb-2">Reset to Default Content</h3>
              <p class="text-xs text-brand-muted mb-4">Restore the default sample books and ChoiceScript games. This clears any local edits.</p>
              <button id="reset-defaults-btn" class="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all">
                Reset All to Defaults
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Tabs switching
    const tabBtns = document.querySelectorAll('.studio-tab-btn');
    tabBtns.forEach((btn) => {
      btn.onclick = () => {
        const tab = btn.getAttribute('data-tab');
        this.activeTab = tab;
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.studio-tab-pane').forEach((pane) => {
          pane.classList.add('hidden');
        });
        document.getElementById(`tab-${tab}`)?.classList.remove('hidden');
      };
    });

    // Word count calculation
    const bodyInput = document.getElementById('chapter-body-input');
    const wordCountSpan = document.getElementById('chapter-word-count');
    if (bodyInput && wordCountSpan) {
      bodyInput.oninput = () => {
        const words = bodyInput.value.split(/\s+/).filter(Boolean).length;
        wordCountSpan.textContent = `${words} words`;
      };
    }

    // Auto-fill chapter number based on selected book
    const bookSelect = document.getElementById('chapter-book-select');
    const chNumInput = document.getElementById('chapter-num-input');
    const updateNextNum = () => {
      if (bookSelect && chNumInput) {
        const selectedBook = this.storage.getBookById(bookSelect.value);
        if (selectedBook) {
          chNumInput.value = selectedBook.chapters.length + 1;
        }
      }
    };
    if (bookSelect) {
      bookSelect.onchange = updateNextNum;
      updateNextNum();
    }

    // Form 1: Post Chapter
    const postForm = document.getElementById('form-post-chapter');
    if (postForm) {
      postForm.onsubmit = (e) => {
        e.preventDefault();
        const bookId = bookSelect.value;
        const num = parseInt(chNumInput.value) || 1;
        const title = document.getElementById('chapter-title-input').value.trim();
        const content = bodyInput.value.trim();

        if (!title || !content) {
          alert('Please enter a chapter title and content.');
          return;
        }

        const newChapter = this.storage.postChapter(bookId, {
          number: num,
          title,
          content
        });

        if (newChapter) {
          alert(`Chapter "${title}" published successfully!`);
          window.location.hash = `#chapter/${bookId}/${newChapter.id}`;
        }
      };
    }

    // Form 2: Create Book
    const createBookForm = document.getElementById('form-create-book');
    if (createBookForm) {
      createBookForm.onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('new-book-title').value.trim();
        const author = document.getElementById('new-book-author').value.trim();
        const genre = document.getElementById('new-book-genre').value;
        const coverColor = document.getElementById('new-book-cover').value;
        const synopsis = document.getElementById('new-book-synopsis').value.trim();
        const rawTags = document.getElementById('new-book-tags').value.trim();
        const tags = rawTags ? rawTags.split(',').map((t) => t.trim()).filter(Boolean) : [genre];

        const ch1Title = document.getElementById('new-book-ch1-title').value.trim();
        const ch1Content = document.getElementById('new-book-ch1-content').value.trim();

        const newBook = this.storage.createBook({
          title,
          author,
          genre,
          coverColor,
          synopsis,
          tags,
          initialChapterTitle: ch1Title,
          initialChapterContent: ch1Content
        });

        alert(`Book "${title}" created successfully!`);
        window.location.hash = `#book/${newBook.id}`;
      };
    }

    // Form 3: ChoiceScript Quick Syntax Insert
    const quickInserts = document.querySelectorAll('.cs-quick-insert');
    const csCodeArea = document.getElementById('cs-code-input');
    quickInserts.forEach((btn) => {
      btn.onclick = () => {
        const snippet = btn.getAttribute('data-snippet').replace(/\\n/g, '\n');
        if (csCodeArea) {
          const start = csCodeArea.selectionStart;
          const end = csCodeArea.selectionEnd;
          const val = csCodeArea.value;
          csCodeArea.value = val.substring(0, start) + '\n' + snippet + '\n' + val.substring(end);
          csCodeArea.focus();
        }
      };
    });

    // File Upload for ChoiceScript
    const fileUpload = document.getElementById('cs-file-upload');
    if (fileUpload) {
      fileUpload.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          const content = evt.target.result;
          if (csCodeArea) {
            csCodeArea.value = content;
          }

          // Auto-detect title and author from script if present
          const titleMatch = content.match(/\*title\s+(.+)/);
          const authorMatch = content.match(/\*author\s+(.+)/);
          if (titleMatch) {
            document.getElementById('cs-title-input').value = titleMatch[1].trim();
          }
          if (authorMatch) {
            document.getElementById('cs-author-input').value = authorMatch[1].trim();
          }
          alert(`Loaded "${file.name}" into ChoiceScript editor!`);
        };
        reader.readAsText(file);
      };
    }

    // Live Test Runner for ChoiceScript
    const testBtn = document.getElementById('cs-test-run-btn');
    const sandbox = document.getElementById('cs-test-sandbox');
    const sandboxOut = document.getElementById('cs-sandbox-output');
    const closeTestBtn = document.getElementById('cs-close-test-btn');

    if (testBtn && sandbox && csCodeArea) {
      testBtn.onclick = () => {
        const code = csCodeArea.value.trim();
        if (!code) {
          alert('Please enter or paste ChoiceScript code first.');
          return;
        }

        sandbox.classList.remove('hidden');
        try {
          this.testEngine = new ChoiceScriptEngine(code);
          const step = this.testEngine.nextStep();
          this.renderSandboxStep(step, sandboxOut);
        } catch (err) {
          sandboxOut.innerHTML = `<div class="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300">Parser Error: ${err.message}</div>`;
        }
      };
    }

    if (closeTestBtn && sandbox) {
      closeTestBtn.onclick = () => sandbox.classList.add('hidden');
    }

    // Form 3: Submit ChoiceScript Game
    const csForm = document.getElementById('form-create-choicescript');
    if (csForm) {
      csForm.onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('cs-title-input').value.trim();
        const author = document.getElementById('cs-author-input').value.trim();
        const synopsis = document.getElementById('cs-synopsis-input').value.trim();
        const scriptText = csCodeArea.value.trim();

        if (!scriptText) {
          alert('Please write or paste ChoiceScript code.');
          return;
        }

        const newGame = this.storage.createChoiceScriptGame({
          title,
          author,
          synopsis,
          scriptText
        });

        alert(`ChoiceScript game "${title}" published!`);
        window.location.hash = `#play/${newGame.id}`;
      };
    }

    // Export JSON
    const exportBtn = document.getElementById('export-json-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(this.storage.exportDataAsJSON());
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute('href', dataStr);
        dlAnchor.setAttribute('download', `taleforge-backup-${Date.now()}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
      };
    }

    // Import JSON
    const importFile = document.getElementById('import-json-file');
    if (importFile) {
      importFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          const success = this.storage.importDataFromJSON(evt.target.result);
          if (success) {
            alert('Successfully restored TaleForge library from backup!');
            window.location.hash = '#library';
            window.location.reload();
          } else {
            alert('Failed to import backup file. Please verify JSON format.');
          }
        };
        reader.readAsText(file);
      };
    }

    // Reset Defaults
    const resetBtn = document.getElementById('reset-defaults-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('Are you sure you want to restore default books and games? This resets any custom changes.')) {
          this.storage.resetToDefaults();
          alert('Library restored to defaults!');
          window.location.hash = '#library';
          window.location.reload();
        }
      };
    }
  }

  renderSandboxStep(step, container) {
    if (!step || !container) return;

    let html = '';

    if (step.paragraphs && step.paragraphs.length > 0) {
      html += step.paragraphs.map((p) => `<p class="leading-relaxed">${p}</p>`).join('');
    }

    if (step.type === 'page_break') {
      html += `
        <div class="pt-4">
          <button id="sb-continue-btn" class="btn-primary text-xs px-4 py-2 rounded-lg">
            ${this.escapeHTML(step.buttonLabel || 'Continue')}
          </button>
        </div>
      `;
    } else if (step.type === 'choice') {
      html += `
        <div class="space-y-2 pt-4">
          <div class="text-xs font-semibold text-brand-muted">Choose an option:</div>
          ${step.options
            .map(
              (opt) => `
            <button class="sb-option-btn w-full text-left p-2.5 rounded-lg text-xs border border-white/10 hover:bg-white/10 transition-all ${
              opt.selectable ? 'text-brand-light' : 'opacity-40 cursor-not-allowed'
            }" data-id="${opt.id}" ${opt.selectable ? '' : 'disabled'}>
              ${this.escapeHTML(opt.label)}
            </button>
          `
            )
            .join('')}
        </div>
      `;
    } else if (step.type === 'ending') {
      html += `
        <div class="p-3 bg-brand-primary/20 border border-brand-primary/40 rounded-lg text-brand-accent text-xs font-bold mt-4">
          ✦ ChoiceScript Story Completed!
        </div>
      `;
    }

    container.innerHTML = html;

    const contBtn = container.querySelector('#sb-continue-btn');
    if (contBtn) {
      contBtn.onclick = () => {
        const next = this.testEngine.nextStep();
        this.renderSandboxStep(next, container);
      };
    }

    const optBtns = container.querySelectorAll('.sb-option-btn');
    optBtns.forEach((btn) => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const next = this.testEngine.makeChoice(id, step.options);
        this.renderSandboxStep(next, container);
      };
    });
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

window.AuthorStudio = AuthorStudio;
