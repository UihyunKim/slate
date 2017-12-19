const postcss = require('postcss');
const fs = require('fs');

const STYLE_BLOCK_REGEX = /(?:<style>|\{% style %\})([\S\s]*?)(?:<\/style>|\{% endstyle %\})/g;
const CSS_VAR_FUNC_REGEX = /var\(--(.*)\)/;
const CSS_VAR_DECL_REGEX = /--(.*?):\s+(\{\{\s*.*?\s*\}\}).*?;/g;

module.exports = postcss.plugin('custom-properties', (options = {}) => {
  return css => {
    const cssVariablesContent = fs.readFileSync(options.cssVariables, 'utf8');
    const variables = parseCSSVariables(cssVariablesContent);
    css.walkDecls(decl => {
      const match = CSS_VAR_FUNC_REGEX.exec(decl.value);
      if (match) {
        const [, cssVariable] = match;
        if (variables[cssVariable]) {
          decl.value = variables[cssVariable];
        }
      }
    });
  };
});

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
