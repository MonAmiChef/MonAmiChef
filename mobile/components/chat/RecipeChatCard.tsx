import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { 
  Clock, 
  Flame, 
  Dna, 
  Wheat, 
  Droplets, 
  Plus, 
  Check, 
  ChevronDown, 
  ChevronUp,
  ChefHat
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-markdown-display';
import { markdownStyles } from '@/constants/MarkdownStyles';

// Simple helper to fix common markdown rendering issues in react-native-markdown-display
const sanitizeMarkdown = (text: string) => {
  if (!text) return '';
  
  // 1. Normalize line endings and ensure double newlines for blocks
  let sanitized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n\n+/g, '\n\n');

  // 2. Ensure headers and lists have double newlines before them
  sanitized = sanitized
    .replace(/([^\n])\n(#)/g, '$1\n\n$2')
    .replace(/([^\n])\n(\d+\.)/g, '$1\n\n$2')
    .replace(/([^\n])\n(\* )/g, '$1\n\n$2');

  // 3. Move colons OUTSIDE of bold markers (e.g., **Title:** -> **Title**:)
  // This is a common AI pattern that confuses the mobile parser
  sanitized = sanitized.replace(/(\*\*)([^:*]+)(:)(\*\*)/g, '$1$2$4$3');
  
  // 4. Ensure markers touch the content (remove space inside markers if present)
  sanitized = sanitized.replace(/\*\* /g, '**').replace(/ \*\*/g, '**');

  return sanitized.trim();
};

interface RecipeChatCardProps {
  title?: string;
  text: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fat?: number;
  prepTime?: number;
  isAlreadySaved: boolean;
  onSave: () => void;
  onRemove?: () => void;
  isSaving?: boolean;
}

export const RecipeChatCard = ({
  title,
  text,
  calories,
  proteins,
  carbs,
  fat,
  prepTime,
  isAlreadySaved,
  onSave,
  onRemove,
  isSaving = false,
}: RecipeChatCardProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const macros = [
    { label: 'kcal', value: calories, icon: Flame, color: '#f97316' },
    { label: 'prot', value: proteins ? `${proteins}g` : null, icon: Dna, color: '#3b82f6' },
    { label: 'carbs', value: carbs ? `${carbs}g` : null, icon: Wheat, color: '#10b981' },
    { label: 'fat', value: fat ? `${fat}g` : null, icon: Droplets, color: '#eab308' },
  ].filter(m => m.value !== null && m.value !== undefined);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ 
        type: 'timing',
        duration: 600,
      }}
      style={{
        marginVertical: 12,
        borderRadius: 24,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
      }}
    >
      {/* Header / Title Area */}
      <Box className="p-5 bg-slate-50/50 border-b border-slate-100">
        <HStack className="justify-between items-start mb-3">
          <VStack className="flex-1 mr-3">
            <Text className="text-xl font-inter-bold text-slate-900 leading-tight">
              {title || t('chat.new_recipe')}
            </Text>
          </VStack>
          {prepTime && (
            <Box className="bg-white px-3 py-1.5 rounded-full border border-slate-200 flex-row items-center shadow-sm">
              <Clock size={14} color="#64748b" />
              <Text className="ml-1.5 text-xs font-inter-semibold text-slate-600">
                {prepTime}m
              </Text>
            </Box>
          )}
        </HStack>

        {/* Macros Grid */}
        <HStack className="justify-between bg-white/80 p-3 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
          {macros.map((macro, idx) => (
            <VStack key={idx} className="items-center flex-1">
              <macro.icon size={14} color={macro.color} />
              <Text className="text-sm font-inter-bold text-slate-800 mt-1">
                {macro.value}
              </Text>
              <Text className="text-[9px] uppercase tracking-wider font-inter-medium text-slate-400">
                {macro.label}
              </Text>
            </VStack>
          ))}
        </HStack>
      </Box>

      {/* Action Area */}
      <Box className="p-4 bg-white">
        {isAlreadySaved ? (
          <Pressable 
            onPress={onRemove}
            className="flex-row w-full justify-center items-center rounded-2xl border border-green-200 bg-green-50 py-3.5 active:bg-green-100"
          >
            <Check size={20} color="#059669" />
            <Text className="ml-2 font-inter-bold text-green-700">
              {t('chat.already_saved')}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onSave}
            disabled={isSaving}
            className={`flex-row w-full justify-center items-center rounded-2xl py-3.5 shadow-sm shadow-orange-100 ${
              isSaving ? 'bg-slate-100' : 'bg-orange-500 active:bg-orange-600'
            }`}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#94a3b8" />
            ) : (
              <>
                <ChefHat size={20} color="#ffffff" />
                <Text className="ml-2 font-inter-bold text-white text-base">
                  {t('chat.add_to_saved_recipes')}
                </Text>
              </>
            )}
          </Pressable>
        )}

        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          className="mt-3 py-2 flex-row justify-center items-center"
        >
          <Text className="text-sm font-inter-semibold text-slate-400">
            {isExpanded ? t('chat.hide_details') : t('chat.view_full_recipe')}
          </Text>
          {isExpanded ? (
            <ChevronUp size={16} color="#94a3b8" className="ml-1" />
          ) : (
            <ChevronDown size={16} color="#94a3b8" className="ml-1" />
          )}
        </Pressable>
      </Box>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <MotiView
            from={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={{ borderTopWidth: 1, borderTopColor: '#f8fafc' }}
          >
            <Box className="p-5">
              <Markdown mergeStyle={true} style={markdownStyles}>
                {sanitizeMarkdown(text)}
              </Markdown>
            </Box>
          </MotiView>
        )}
      </AnimatePresence>
      
      {/* Footer Info */}
      <Box className="px-5 py-3 bg-slate-50 flex-row items-center border-t border-slate-100">
        <Text className="text-[10px] font-inter-medium text-slate-400 italic">
          ✨ {t('chat.ai_generated_disclaimer')}
        </Text>
      </Box>
    </MotiView>
  );
};
