import { ReturnTag } from '../../tags/return';
import { IEntity } from '../../types';
import { IBaseParser } from './base_parser';

// Parse a constant definition into documentation entities
export default class Attribute implements IBaseParser {
  // Regexp to extract attribute accessor and name
  // See https://docs.ruby-lang.org/en/trunk/syntax/assignment_rdoc.html#label-Local+Variable+Names
  // tslint:disable:max-line-length
  public readonly regExp = new RegExp(
    [
      /^\s*/, // whitespace
      /(?:(?:(?:attr|mattr|cattr)_(reader|writer|accessor))|(?:class_attribute))/, // attribute scope and access type
      /\s+/, // whitespace
      /:([a-z][a-zA-Z0-9_]*).*/, // attribute name
    ]
      .map((r) => r.source)
      .join(''),
  );
  // tslint:enable:max-line-length

  // Attribute name
  private parsedName = '';
  // Attribute accessor
  private parsedAccessor = '';

  constructor(text: string) {
    const match: RegExpExecArray | null = this.regExp.exec(text);
    if (match) {
      const [, accessor, name] = match;
      this.parsedName = name;
      this.parsedAccessor = accessor;
    }
  }

  // Is this parser ready to process the text
  public isApplicable(): boolean {
    return this.parsedName !== '' && this.parsedAccessor !== '';
  }

  // Parse documentation tree
  public parse(): IEntity[] {
    return [new ReturnTag()];
  }
}
