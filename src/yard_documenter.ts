import {
  Document,
  Position,
  window,
  workspace,
  snippetManager,
  Range,
} from 'coc.nvim';
import { Builder } from './builder';

// Generate YARD comment
export default class YardDocumenter {
  // Build and insert documentation snippet
  public static async generate() {
    const doc = await workspace.document;
    const position = await window.getCursorPosition();
    const fileformat = await workspace.nvim.getOption('fileformat');
    const yard = new YardDocumenter(
      doc,
      position,
      position.line,
      doc.getline(position.line),
      fileformat === 'unix' ? '\n' : '\r\n',
    );

    return yard.generate();
  }

  constructor(
    private doc: Document,
    private position: Position,
    private lineNumber: number,
    private lineText: string,
    private eol: string,
  ) {}

  private generate() {
    // Check if documenter should run
    if (!this.shouldRun()) {
      return;
    }

    if (!this.lineText) {
      return;
    }

    // Resolve documenter by current line's content
    const snippet = new Builder(this.lineText, this.eol).build();
    if (!snippet) {
      return;
    }

    // Insert documentation snippet
    const pos = this.snippetPosition();
    if (!pos) {
      return;
    }
    return snippetManager.insertSnippet(
      snippet.value,
      true,
      Range.create(pos, pos),
    );
  }

  // Get position for a snippet
  private snippetPosition(): Position | undefined {
    const firstNotWhitespace = this.lineText
      .split('')
      .findIndex((c) => c !== ' ');
    if (firstNotWhitespace === -1) {
      return;
    }
    return Position.create(this.position.line, firstNotWhitespace);
  }

  // Check if previous line already has some comment
  private commentExists(): boolean {
    if (this.lineNumber === 0) {
      return false;
    }
    const prevLine = this.doc.getline(this.position.line - 1);
    return prevLine.trim().startsWith('#');
  }

  // Is documenter should run
  private shouldRun(): boolean {
    return !this.commentExists();
  }
}
