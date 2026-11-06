/**
 * ChoiceScript Engine for TaleForge
 * Robust parser & interpreter for interactive fiction stories written in ChoiceScript.
 */

class ChoiceScriptEngine {
  constructor(scriptText, options = {}) {
    this.rawScript = scriptText || '';
    this.lines = [];
    this.labels = new Map();
    this.vars = {};
    this.meta = {
      title: 'Untitled ChoiceScript Story',
      author: 'Anonymous Author',
      sceneList: []
    };
    this.statCharts = [];
    this.currentLineIndex = 0;
    this.history = [];
    this.isFinished = false;
    this.onStateChange = options.onStateChange || null;

    this.parseLines();
  }

  /**
   * Split into structured line objects and index labels
   */
  parseLines() {
    const rawLines = this.rawScript.replace(/\r\n/g, '\n').split('\n');
    this.lines = rawLines.map((raw, idx) => {
      // Calculate indentation level (2 spaces or 1 tab = 1 level)
      const leadingSpaces = raw.match(/^[ \t]*/)[0];
      const indent = leadingSpaces.replace(/\t/g, '  ').length;
      const trimmed = raw.trim();
      return {
        lineNum: idx + 1,
        indent,
        trimmed,
        raw
      };
    });

    // First pass: extract metadata, labels, and initial variables
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const text = line.trimmed;

      if (!text || text.startsWith('*comment')) continue;

      if (text.startsWith('*title ')) {
        this.meta.title = text.substring(7).trim();
      } else if (text.startsWith('*author ')) {
        this.meta.author = text.substring(8).trim();
      } else if (text.startsWith('*label ')) {
        const labelName = text.substring(7).trim();
        this.labels.set(labelName, i);
      } else if (text.startsWith('*create ')) {
        const parts = text.substring(8).trim().match(/^(\w+)\s+(.+)$/);
        if (parts) {
          const varName = parts[1];
          const valStr = parts[2];
          this.vars[varName] = this.parseValue(valStr);
        }
      }
    }
  }

  parseValue(valStr) {
    valStr = valStr.trim();
    if (valStr.startsWith('"') && valStr.endsWith('"')) {
      return valStr.substring(1, valStr.length - 1);
    }
    if (valStr.startsWith("'") && valStr.endsWith("'")) {
      return valStr.substring(1, valStr.length - 1);
    }
    if (valStr === 'true') return true;
    if (valStr === 'false') return false;
    if (!isNaN(Number(valStr))) return Number(valStr);
    return valStr;
  }

  evaluateCondition(condStr) {
    if (!condStr) return true;
    let expr = condStr.trim();
    if (expr.startsWith('(') && expr.endsWith(')')) {
      expr = expr.substring(1, expr.length - 1).trim();
    }

    // Replace ChoiceScript single '=' with '==' if not already ==, <=, >=, !=
    expr = expr.replace(/(?<![<>=!])=(?!=)/g, '===');
    expr = expr.replace(/<===/g, '<=').replace(/>===/g, '>=');
    expr = expr.replace(/\band\b/gi, '&&');
    expr = expr.replace(/\bor\b/gi, '||');
    expr = expr.replace(/\bnot\b/gi, '!');

    // Replace variable names with their values
    try {
      const varNames = Object.keys(this.vars);
      // Sort variable names by length descending so prefix vars don't replace substrings
      varNames.sort((a, b) => b.length - a.length);

      const scope = { ...this.vars };
      const func = new Function(...Object.keys(scope), `"use strict"; return Boolean(${expr});`);
      return func(...Object.values(scope));
    } catch (e) {
      console.warn(`Condition evaluation failed for "${condStr}":`, e);
      return false;
    }
  }

  evaluateExpression(exprStr, targetVar = null) {
    let expr = exprStr.trim();
    // Support ChoiceScript relative syntax: *set health + 10 or *set health - 20
    if (targetVar && (expr.startsWith('+ ') || expr.startsWith('- ') || expr.startsWith('* ') || expr.startsWith('/ '))) {
      const op = expr[0];
      const rest = expr.substring(1).trim();
      expr = `${targetVar} ${op} (${rest})`;
    }

    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (expr.startsWith('"') && expr.endsWith('"')) return expr.slice(1, -1);
    if (!isNaN(Number(expr))) return Number(expr);

    try {
      const scope = { ...this.vars };
      const func = new Function(...Object.keys(scope), `"use strict"; return (${expr});`);
      return func(...Object.values(scope));
    } catch (e) {
      // Fallback: if it's an existing variable name
      if (this.vars[expr] !== undefined) {
        return this.vars[expr];
      }
      return expr;
    }
  }

  interpolateText(text) {
    if (!text) return '';
    // Handle variable interpolation: ${var}, $!{var} (capitalized), $!!{var} (all caps)
    return text.replace(/\$(!?)(!?)\{([a-zA-Z0-9_]+)\}/g, (match, capFirst, allCaps, varName) => {
      const val = this.vars[varName] !== undefined ? String(this.vars[varName]) : '';
      if (allCaps) {
        return val.toUpperCase();
      }
      if (capFirst) {
        return val.charAt(0).toUpperCase() + val.slice(1);
      }
      return val;
    });
  }

  formatMarkup(text) {
    if (!text) return '';
    let html = text
      .replace(/\[b\](.*?)\[\/b\]/gi, '<strong>$1</strong>')
      .replace(/\[i\](.*?)\[\/i\]/gi, '<em>$1</em>')
      .replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>')
      .replace(/\[s\](.*?)\[\/s\]/gi, '<s>$1</s>');
    return html;
  }

  /**
   * Save a snapshot for undo or state save
   */
  createSnapshot() {
    return {
      lineIndex: this.currentLineIndex,
      vars: JSON.parse(JSON.stringify(this.vars)),
      statCharts: JSON.parse(JSON.stringify(this.statCharts)),
      isFinished: this.isFinished
    };
  }

  restoreSnapshot(snapshot) {
    this.currentLineIndex = snapshot.lineIndex;
    this.vars = JSON.parse(JSON.stringify(snapshot.vars));
    this.statCharts = JSON.parse(JSON.stringify(snapshot.statCharts));
    this.isFinished = snapshot.isFinished;
  }

  /**
   * Execute the story up to the next player interaction point (choice, page break, or ending)
   */
  nextStep() {
    if (this.isFinished || this.currentLineIndex >= this.lines.length) {
      this.isFinished = true;
      return {
        type: 'ending',
        text: 'The story has reached its conclusion.',
        options: []
      };
    }

    const passageParagraphs = [];
    let currentParagraph = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const pText = currentParagraph.join(' ').trim();
        if (pText) {
          passageParagraphs.push(this.formatMarkup(this.interpolateText(pText)));
        }
        currentParagraph = [];
      }
    };

    while (this.currentLineIndex < this.lines.length) {
      const lineObj = this.lines[this.currentLineIndex];
      const text = lineObj.trimmed;
      this.currentLineIndex++;

      // Skip blank lines
      if (!text) {
        flushParagraph();
        continue;
      }

      // Comments
      if (text.startsWith('*comment')) continue;

      // Header meta already parsed
      if (text.startsWith('*title ') || text.startsWith('*author ') || text.startsWith('*scene_list')) {
        continue;
      }

      // Variable creation
      if (text.startsWith('*create ') || text.startsWith('*temp ')) {
        const parts = text.replace(/^\*(create|temp)\s+/, '').match(/^(\w+)\s+(.+)$/);
        if (parts) {
          this.vars[parts[1]] = this.parseValue(parts[2]);
        }
        continue;
      }

      // Variable mutation
      if (text.startsWith('*set ')) {
        const parts = text.substring(5).trim().match(/^(\w+)\s+(.+)$/);
        if (parts) {
          const varName = parts[1];
          const expr = parts[2];
          this.vars[varName] = this.evaluateExpression(expr, varName);
        }
        continue;
      }

      // Label definition (anchor)
      if (text.startsWith('*label ')) {
        continue;
      }

      // Goto jump
      if (text.startsWith('*goto ')) {
        const target = text.substring(6).trim();
        if (this.labels.has(target)) {
          this.currentLineIndex = this.labels.get(target) + 1;
        } else {
          console.warn(`Label not found: ${target}`);
        }
        continue;
      }

      // Finish / Ending
      if (text === '*finish' || text === '*ending') {
        flushParagraph();
        this.isFinished = true;
        return {
          type: 'ending',
          paragraphs: passageParagraphs,
          stats: this.getStatsDisplay()
        };
      }

      // Line break
      if (text === '*line_break') {
        flushParagraph();
        passageParagraphs.push('<br/>');
        continue;
      }

      // Stat chart
      if (text === '*stat_chart') {
        flushParagraph();
        // Parse the stat chart lines immediately following
        const chartItems = [];
        while (this.currentLineIndex < this.lines.length) {
          const chartLine = this.lines[this.currentLineIndex];
          if (!chartLine.trimmed || chartLine.indent <= lineObj.indent) {
            break;
          }
          const cText = chartLine.trimmed;
          const match = cText.match(/^(text|percent|opposed_pair)\s+(\w+)(?:\s+(.+))?$/);
          if (match) {
            chartItems.push({
              type: match[1],
              varName: match[2],
              label: match[3] || match[2]
            });
          }
          this.currentLineIndex++;
        }
        this.statCharts = chartItems;
        continue;
      }

      // Page break
      if (text.startsWith('*page_break')) {
        flushParagraph();
        const btnLabel = text.substring(11).trim() || 'Continue';
        return {
          type: 'page_break',
          buttonLabel: btnLabel,
          paragraphs: passageParagraphs,
          stats: this.getStatsDisplay()
        };
      }

      // Conditionals: *if, *elseif, *else
      if (text.startsWith('*if ') || text.startsWith('*elseif ') || text.startsWith('*else')) {
        flushParagraph();
        const handled = this.handleConditionalBlock(lineObj);
        if (handled && handled.shouldBreak) {
          return handled.result;
        }
        continue;
      }

      // Choice block: *choice
      if (text === '*choice') {
        flushParagraph();
        const choiceData = this.parseChoiceBlock(lineObj.indent);
        return {
          type: 'choice',
          paragraphs: passageParagraphs,
          options: choiceData,
          stats: this.getStatsDisplay()
        };
      }

      // Standard prose line
      currentParagraph.push(text);
    }

    flushParagraph();
    this.isFinished = true;
    return {
      type: 'ending',
      paragraphs: passageParagraphs,
      stats: this.getStatsDisplay()
    };
  }

  /**
   * Handle conditional blocks (*if, *elseif, *else)
   */
  handleConditionalBlock(startLineObj) {
    let checkIndex = this.currentLineIndex - 1;
    let matchedBlock = null;

    // Collect all branches in this chain (if, elseif, else)
    const branches = [];
    let i = checkIndex;

    while (i < this.lines.length) {
      const line = this.lines[i];
      if (!line.trimmed) {
        i++;
        continue;
      }
      if (line.indent !== startLineObj.indent && branches.length > 0) {
        break;
      }

      if (line.trimmed.startsWith('*if ')) {
        if (branches.length > 0) break; // New separate if
        branches.push({
          type: 'if',
          cond: line.trimmed.substring(4).trim(),
          lineIndex: i,
          indent: line.indent
        });
        i++;
      } else if (line.trimmed.startsWith('*elseif ')) {
        branches.push({
          type: 'elseif',
          cond: line.trimmed.substring(8).trim(),
          lineIndex: i,
          indent: line.indent
        });
        i++;
      } else if (line.trimmed === '*else') {
        branches.push({
          type: 'else',
          cond: null,
          lineIndex: i,
          indent: line.indent
        });
        i++;
      } else {
        break;
      }

      // Skip lines belonging to this branch
      while (i < this.lines.length) {
        const next = this.lines[i];
        if (!next.trimmed) {
          i++;
          continue;
        }
        if (next.indent <= startLineObj.indent) {
          break;
        }
        i++;
      }
    }

    // Determine which branch condition holds true
    for (const b of branches) {
      if (b.type === 'else' || this.evaluateCondition(b.cond)) {
        matchedBlock = b;
        break;
      }
    }

    if (matchedBlock) {
      // Set line index to the first line inside the true branch
      this.currentLineIndex = matchedBlock.lineIndex + 1;
    } else {
      // No condition met, advance past all branches
      this.currentLineIndex = i;
    }

    return null;
  }

  /**
   * Parse #Options under a *choice command
   */
  parseChoiceBlock(choiceIndent) {
    const options = [];
    const baseIndent = choiceIndent;

    while (this.currentLineIndex < this.lines.length) {
      const line = this.lines[this.currentLineIndex];
      if (!line.trimmed) {
        this.currentLineIndex++;
        continue;
      }

      // If indent returns back to choice level or lower, choice definition has ended
      if (line.indent <= baseIndent) {
        break;
      }

      const text = line.trimmed;
      let optionText = null;
      let isSelectable = true;
      let optionIndex = this.currentLineIndex;

      if (text.startsWith('#')) {
        optionText = text.substring(1).trim();
      } else if (text.startsWith('*selectable_if ')) {
        const match = text.match(/^\*selectable_if\s+(\(.+?\)|\S+)\s+#(.+)$/);
        if (match) {
          const cond = match[1];
          optionText = match[2].trim();
          isSelectable = this.evaluateCondition(cond);
        }
      }

      if (optionText !== null) {
        const optIndent = line.indent;
        this.currentLineIndex++;

        // Find the block of code inside this option
        const targetLine = this.currentLineIndex;

        // Skip until next option or end of choice block
        while (this.currentLineIndex < this.lines.length) {
          const next = this.lines[this.currentLineIndex];
          if (!next.trimmed) {
            this.currentLineIndex++;
            continue;
          }
          if (next.indent <= optIndent) {
            break;
          }
          this.currentLineIndex++;
        }

        options.push({
          id: options.length,
          label: this.interpolateText(optionText),
          selectable: isSelectable,
          targetLineIndex: targetLine
        });
      } else {
        this.currentLineIndex++;
      }
    }

    return options;
  }

  /**
   * Select a choice option and advance
   */
  makeChoice(optionId, availableOptions) {
    const chosen = availableOptions.find((o) => o.id === optionId);
    if (!chosen || !chosen.selectable) {
      console.warn('Invalid option chosen');
      return null;
    }

    // Save history snapshot before making choice
    this.history.push(this.createSnapshot());

    // Jump to the code block for this option
    this.currentLineIndex = chosen.targetLineIndex;
    return this.nextStep();
  }

  /**
   * Undo last player choice
   */
  undo() {
    if (this.history.length === 0) return null;
    const lastSnapshot = this.history.pop();
    this.restoreSnapshot(lastSnapshot);
    return this.nextStep();
  }

  /**
   * Restart the game
   */
  restart() {
    this.currentLineIndex = 0;
    this.vars = {};
    this.history = [];
    this.isFinished = false;
    this.parseLines();
    return this.nextStep();
  }

  /**
   * Get formatted stats for the stats screen or modal
   */
  getStatsDisplay() {
    const list = [];
    if (this.statCharts.length > 0) {
      for (const item of this.statCharts) {
        const val = this.vars[item.varName];
        list.push({
          type: item.type,
          label: item.label,
          varName: item.varName,
          value: val !== undefined ? val : 0
        });
      }
    } else {
      // Default: show all defined numeric and string variables
      for (const [key, val] of Object.entries(this.vars)) {
        if (key.startsWith('_')) continue;
        const type = typeof val === 'number' && val >= 0 && val <= 100 ? 'percent' : 'text';
        list.push({
          type,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          varName: key,
          value: val
        });
      }
    }
    return list;
  }
}

window.ChoiceScriptEngine = ChoiceScriptEngine;
