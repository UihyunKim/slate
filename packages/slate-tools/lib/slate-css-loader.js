const loadUtils = require('loader-utils');
const fs = require('fs');

const STYLE_BLOCK_REGEX = /(?:<style>|\{% style %\})([\S\s]*?)(?:<\/style>|\{% endstyle %\})/g;
const CSS_VAR_FUNC_REGEX = /var\(--(.*?)\)/g;
const CSS_VAR_DECL_REGEX = /--(.*?):\s+(\{\{\s*.*?\s*\}\}).*?;/g;

function parseCSSVariables(content) {
  const variables = {};
  let styleBlock;
  while ((styleBlock = STYLE_BLOCK_REGEX.exec(content)) != null) {
    let cssVariableDecl;
    while ((cssVariableDecl = CSS_VAR_DECL_REGEX.exec(styleBlock)) != null) {
      const [, cssVariable, liquidVariable] = cssVariableDecl;
      variables[cssVariable] = liquidVariable;
    }
  }
  return variables;
}

function SlateCSSLoader(source) {
  const options = loadUtils.getOptions(this);
  const sourceMap = options.sourceMap || false;
  const cssVariablesPath = options.cssVariablesPath;

  this.addDependency(cssVariablesPath);
  const cssVariablesContent = fs.readFileSync(cssVariablesPath, 'utf8');
  const variables = parseCSSVariables(cssVariablesContent);

  const result = source.replace(CSS_VAR_FUNC_REGEX, (match, cssVariable, offset, str) => {
    if (variables[cssVariable]) {
      return variables[cssVariable];
    }
    return cssVariable;
  });

  return result;
};

module.exports = SlateCSSLoader;