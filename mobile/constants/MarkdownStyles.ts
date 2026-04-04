export const markdownStyles = {
  // Base text styles
  body: {
    color: '#374151',
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Krub_400Regular', // Using Krub for body
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    fontFamily: 'Krub_400Regular',
  },

  // Emphasis
  strong: {
    color: '#111827',
    fontFamily: 'Krub_600SemiBold', // Matching Krub for bolding within body
  },
  em: {
    fontFamily: 'Inter_400Regular_Italic', // Keeping Inter italic as fallback/secondary
  },

  // Headings
  heading1: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 24,
    color: '#0f172a',
    fontFamily: 'Inter_700Bold', // Inter for headings
  },
  heading2: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 20,
    color: '#1e293b',
    fontFamily: 'Inter_600SemiBold',
  },
  heading3: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 18,
    color: '#374151',
    fontFamily: 'Inter_500Medium',
  },

  // Lists
  bullet_list: {
    marginTop: 4,
    marginBottom: 16,
  },
  ordered_list: {
    marginTop: 4,
    marginBottom: 16,
  },
  list_item: {
    marginBottom: 8,
    lineHeight: 26,
    fontFamily: 'Krub_400Regular', // Krub for list content
  },
  bullet_list_icon: {
    color: '#f97316',
    marginRight: 8,
  },
  ordered_list_icon: {
    color: '#f97316',
    marginRight: 8,
    fontWeight: 'bold',
  },

  // Other elements
  blockquote: {
    backgroundColor: '#f8fafc',
    borderLeftColor: '#f97316',
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 12,
    borderRadius: 4,
    fontFamily: 'Krub_400Regular',
  },
  code_inline: {
    backgroundColor: '#f1f5f9',
    color: '#ef4444',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'Inter_500Medium',
  },
  code_block: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
    fontSize: 14,
  },
  hr: {
    backgroundColor: '#e2e8f0',
    height: 1,
    marginVertical: 20,
  },
};
