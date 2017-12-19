const postcss = require('postcss');
const plugin = require('../');

function run(input, output, opts) {
  return postcss([plugin(opts)])
    .process(input)
    .then(result => {
      expect(result.css).toEqual(output);
      expect(result.warnings().length).toBe(0);
      return true;
    });
}

it('reads css variables from a liquid file and converts css variables to liquid variables in css input', () => {
  const input = `
  .heading {
    color: var(--headings_color);
    background-color: '#FF00FF';
  }`;

  const expected = `
  .heading {
    color: {{ settings.headings_color }};
    background-color: '#FF00FF';
  }`;

  return run(input, expected, {
    cssVariables: './tests/files/css-variables.liquid',
  });
});

it('replaces all occurences of the same css variable', () => {
  const input = `
  .heading {
    color: var(--headings_color);
    background-color: '#FF00FF';
  }

  .title {
    color: var(--headings_color);
  }

  .titre {
    background-color: '#FF00FF';
    color: var(--headings_color);
  }`;

  const expected = `
  .heading {
    color: {{ settings.headings_color }};
    background-color: '#FF00FF';
  }

  .title {
    color: {{ settings.headings_color }};
  }

  .titre {
    background-color: '#FF00FF';
    color: {{ settings.headings_color }};
  }`;

  return run(input, expected, {
    cssVariables: './tests/files/css-variables.liquid',
  });
});

it('reads css variables in a {% style %} tag from a liquid file and converts css variables to liquid variables in css input', () => {
  const input = `
  .heading {
    color: var(--some_color);
    background-color: '#FF00FF';
    font-family: var(--test_value);
  }`;

  const expected = `
  .heading {
    color: {{ settings.some_color }};
    background-color: '#FF00FF';
    font-family: {{ test_value }};
  }`;

  return run(input, expected, {
    cssVariables: './tests/files/css-variables-styletag.liquid',
  });
});
