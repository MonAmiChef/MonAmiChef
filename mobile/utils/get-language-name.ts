export const getLanguageName = (langCode: string) => {
  const mapping: Record<string, string> = {
    fr: 'French',
    en: 'English',
  };

  const shortCode = langCode.split('-')[0];

  return mapping[shortCode] || 'English';
};
