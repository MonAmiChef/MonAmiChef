export const capitalizeFull = (str: string): string => {
  if (!str) return '';

  return str
    .toLowerCase()
    .split(/([ -])/)
    .map((word) => {
      if (word === ' ' || word === '-') return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');
};
