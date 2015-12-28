
class RoutePath {

  static forwardSlash          = /\//;
  static startsWithColon       = /^\:/;
  static validChars            = '([a-zA-Z0-9-_~\\.%@]+)';
  static matchForwardSlash     = "\\/";


  constructor(pattern, action) {
    this.action     = action;
    this.rawPattern = pattern;
    this.fragments  = [];
    this.tokens     = [];
    this.setPattern(pattern);
  }

  setPattern(pattern){
    if (pattern instanceof RegExp) {
      this.pattern = pattern;
    } else {
      this.pattern = this.compile(pattern);
    }
  }

  compile(pattern) {
    let parts = pattern.split(RoutePath.forwardSlash);

    parts.forEach((part, index) => {
      if (part.match(RoutePath.startsWithColon)) {
        this.tokens.push(part.replace(RoutePath.startsWithColon, ''));
        this.fragments.push(RoutePath.validChars);
      } else {
        this.fragments.push(part);
      }
    });

    return this.compileRegexp();
  }

  compileRegexp() {
    return new RegExp(this.fragments.join(RoutePath.matchForwardSlash) + "$");
  }

  parseTokens(path) {
    // unsure why +1
    let tokenLength = this.tokens.length + 1;
    let matches     = path.match(this.pattern);
    if (!matches) {
      return [];
    }
    let values      = matches.slice(1, tokenLength);
    return this.tokens.reduce((finalValues, token, index, tokens) => {
       finalValues[token] = values[index];
       return finalValues;
     },
     {} // initial finalValues
    );
  }
}

export default RoutePath;