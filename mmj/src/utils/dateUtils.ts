export const formatRelativeDate = (dateStr: string, language: 'en' | 'pl' = 'en'): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return language === 'pl' ? 'Dzisiaj' : 'Today';
  if (diffDays === 1) return language === 'pl' ? 'Wczoraj' : 'Yesterday';
  if (diffDays < 7) return language === 'pl' ? `${diffDays} dni temu` : `${diffDays} days ago`;
  return date.toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US');
};
