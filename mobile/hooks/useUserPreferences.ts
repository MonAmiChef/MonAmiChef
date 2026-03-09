import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Session } from '@supabase/supabase-js';
import {
  getUserPreferences,
  upsertUserPreferences,
  UserPreferences,
  UpsertUserPreferencesData,
} from '@/services/user-preferences.api';

export const useUserPreferences = (session: Session | null) => {
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  const query = useQuery({
    queryKey: ['user-preferences', userId],
    queryFn: () => getUserPreferences(session!),
    enabled: !!session && !session.user.is_anonymous,
  });

  const mutation = useMutation({
    mutationFn: (data: UpsertUserPreferencesData) =>
      upsertUserPreferences(session!, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ['user-preferences', userId],
      });
      const previous = queryClient.getQueryData<UserPreferences | null>([
        'user-preferences',
        userId,
      ]);
      queryClient.setQueryData(
        ['user-preferences', userId],
        (old: UserPreferences | null) => ({
          ...old,
          ...data,
        }),
      );
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          ['user-preferences', userId],
          context.previous,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['user-preferences', userId],
      });
    },
  });

  return { ...query, upsert: mutation.mutate };
};
