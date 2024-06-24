module.exports = {
  CSS: {
    beautifiers: ['Prettier', 'Pretty Diff', 'JS-Beautify', 'CSScomb'],
  },
  HTML: {
    beautifiers: ['Pretty Diff', 'JS-Beautify'],
  },
  JSON: {
    beautifiers: ['Prettier'],
  },
  JSON5: {
    beautifiers: ['Prettier'],
  },
  JSX: {
    beautifiers: ['Prettier'],
    jsx_brackets: true,
  },
  JavaScript: {
    // 不要使用 JS-Beautify，这会导致 ?. 被错误的美化导致语法错误
    beautifiers: ['Prettier'], // 有了 ESLint，就能在本文件里对象/数组的末尾强制添加逗号。但奇怪的是在其他 js 文件里没有这效果
    // Prettier: { prefer_beautifier_config: true },
    arrow_parens: 'always',
    end_with_comma: true,
    end_with_semicolon: false, // unibeautify 文档说默认为 false，但我试验下来其实默认为 true，应该因为在 Prettier 里默认为 true。
    max_preserve_newlines: 1, // 文档（https://unibeautify.com/docs/option-max-preserve-newlines）说只有 JS-Beautify 支持这个配置，但我试验 Prettier 也支持，应当是 Prettier 默认有这个设置，不需要 unibeautify 添加。
    quotes: 'single',
    space_after_anon_function: true,
    wrap_line_length: 80, // 大多数工具都默认设80，为了避免反复设置，就都用默认值80吧。
  },
  SCSS: {
    beautifiers: ['Prettier'],
  },
  Sass: {
    beautifiers: ['CSScomb'],
  },
  Vue: {
    beautifiers: ['Prettier'],
  },
  TypeScript: {
    beautifiers: ['Prettier'],
  },
  Java: {
    beautifiers: ['Pretty Diff'],
  },
}
