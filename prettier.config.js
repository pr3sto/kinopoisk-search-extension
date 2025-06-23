/** @type {import("prettier").Config} */
const config = {
  singleQuote: true,
  bracketSameLine: true,
  plugins: ['prettier-plugin-svelte', 'prettier-plugin-organize-imports'],
  // This tells prettier to handle svelte files separately
  overrides: [
    {
      files: '*.svelte',
      options: { parser: 'svelte' },
    },
  ],
};
export default config;
