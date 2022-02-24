import { DescriptionTag } from '../../tags/description';
import { OptionTag } from '../../tags/option';
import { ParamTag } from '../../tags/param';
import { ReturnTag } from '../../tags/return';
import { IEntity } from '../../types';
import { IBaseParser } from './base_parser';

// Parse a class or an instance method definition into documentation entities
export default class MethodDef implements IBaseParser {
  // Regexp to extract method's name, its scope and params
  // See https://docs.ruby-lang.org/en/trunk/syntax/methods_rdoc.html#label-Method+Names
  // tslint:disable:max-line-length
  public readonly regExp = new RegExp(
    [
      /(?:def)\s+/, // def
      /(?:self)?\.?/, // self.
      /([a-zA-Z_\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf][a-zA-Z_0-9\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]+[!?=]?|\+|-|\*|\*\*|\/|%|&|\^|>>|<<|==|!=|===|=~|!~|<=>|<|<=|>|>=|\[\]=|\[\]|\+@|-@|!@|~@)?/, // method name
      /(\(.*\)|[^;].*)?/, // method parameters
    ]
      .map((r) => r.source)
      .join(''),
  );
  // tslint:enable:max-line-length

  // Method name
  private parsedName = '';
  // Method params string with parenthesis
  private parsedParams = '';

  constructor(text: string) {
    const match: RegExpExecArray | null = this.regExp.exec(text);
    if (match) {
      const [, name, params] = match;
      this.parsedName = name;
      this.parsedParams = params;
    }
  }

  // Is this parser ready to process the text
  public isApplicable(): boolean {
    return this.parsedName !== '';
  }

  // Parse documentation tree
  public parse(): IEntity[] {
    const entities: (IEntity | undefined)[] = [
      this.buildDescription(),
      ...this.buildParams(),
      this.buildReturn(),
    ];
    return entities.filter(
      (element): element is IEntity => element !== undefined,
    );
  }

  // Build description section
  private buildDescription(): IEntity {
    return new DescriptionTag();
  }

  // Build params section
  private buildParams(): (IEntity | undefined)[] {
    if (!this.parsedParams) {
      return [];
    }
    const clearedParams: string = this.parsedParams.replace(/\(|\)|\s/g, '');
    if (clearedParams === '') {
      return [];
    }
    return clearedParams.split(',').map((param) => {
      const match = /^([^=:]*)[:=]?(.*)$/.exec(param);
      if (!match) {
        return;
      }
      const [, name, defaultValue] = match;
      let options: OptionTag[] = [];
      if (defaultValue === '{}') {
        options = this.seedOptions(name);
      }
      return new ParamTag({ name, defaultValue, options });
    });
  }

  // Build return section
  private buildReturn(): IEntity | undefined {
    if (this.parsedName === 'initialize') {
      return;
    }
    return new ReturnTag();
  }

  // Build options hash section
  private seedOptions(paramName: string, count = 3): OptionTag[] {
    const options: OptionTag[] = [];
    Array.from(Array(count), () =>
      options.push(new OptionTag({ paramName, defaultValue: undefined })),
    );
    return options;
  }
}
