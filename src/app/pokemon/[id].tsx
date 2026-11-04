import { useLocalSearchParams, type ErrorBoundaryProps } from 'expo-router';
import { useColorScheme, View } from 'react-native';

import { ErrorState } from '@/components/ui/error-state';
import { DetailScreen } from '@/features/detail/detail-screen';
import { errorCopy } from '@/lib/errors';
import { palettes } from '@/theme/tokens';

export default function PokemonDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // `key` remounts the screen when the tree opens another Pokémon (fresh shiny, scroll, entrance).
  return <DetailScreen key={id} id={Number(id)} />;
}

/** If the detail screen crashes, only this screen shows an error; the tabs keep working. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const colors = palettes[useColorScheme() === 'dark' ? 'dark' : 'light'];
  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
      <ErrorState {...errorCopy(error)} colors={colors} onRetry={retry} />
    </View>
  );
}
