export default {
  input: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],

  output: 'locales/$LOCALE/$NAMESPACE.json',

  locales: ['fr', 'en'],
  defaultValue: (locale, namespace, key) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return locale === 'fr' ? key : '';
  },
  keySeparator: '.',
  namespaceSeparator: false,
};
