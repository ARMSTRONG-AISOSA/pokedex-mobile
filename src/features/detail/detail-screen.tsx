import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAbout } from '@/data/queries/useAbout';
import { useEvolutionChain } from '@/data/queries/useEvolutionChain';
import { usePokemon } from '@/data/queries/usePokemon';
import { TEAM_SIZE } from '@/data/storage/team';
import { useUserData } from '@/data/storage/user-data-provider';
import { evolutionNote } from '@/domain/evolution';
import { displayName } from '@/domain/names';
import { errorCopy } from '@/lib/errors';
import { haptic } from '@/lib/haptics';
import { ease } from '@/theme/motion';
import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AboutSection, AboutSkeleton } from './about-section';
import { ART_BOTTOM, ART_SIZE, DetailHero, HeroArtwork } from './detail-hero';
import { EvolutionTree, EvolutionTreeSkeleton } from './evolution-tree';
import { MatchupGroups } from './matchup-groups';
import { StatBars, StatBarsSkeleton } from './stat-bars';
import { TeamButton } from './team-button';

/**
 * The detail screen (DESIGN.md §5.2). Rendered with `key={id}`, so opening
 * another Pokémon from the tree starts fresh: shiny off, scroll at the top,
 * entrance motion again.
 */
export function DetailScreen({ id }: { id: number }) {
  const { colors, typeColors, text, scheme } = useTheme();
  const pokemon = usePokemon(id);
  const evolution = useEvolutionChain(id);
  const about = useAbout(id);
  const { favorites, setFavorites, team, setTeam } = useUserData();
  const [shiny, setShiny] = useState(false);
  const [heroHeight, setHeroHeight] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);

  const goBack = () => {
    haptic('light');
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const openFromTree = (nextId: number) => {
    haptic('light');
    router.setParams({ id: String(nextId) });
  };

  if (!pokemon.data) {
    return pokemon.isError ? (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <ErrorState
          {...errorCopy(pokemon.error)}
          colors={colors}
          onRetry={() => void pokemon.refetch()}
        />
        <View style={styles.backFromError}>
          <IconButton accessibilityLabel="Back to list" onPress={goBack}>
            <Icon name="back" size={22} color={colors.ink} strokeWidth={2.4} />
          </IconButton>
        </View>
      </View>
    ) : (
      <LoadingDetail onBack={goBack} />
    );
  }

  const p = pokemon.data;
  const deep = typeColors[p.types[0]].d;
  const saved = favorites.includes(p.id);
  const onTeam = team.includes(p.id);
  const name = displayName(p.name);

  const toggleSaved = () => {
    const next = saved ? favorites.filter((f) => f !== p.id) : [...favorites, p.id];
    haptic(saved ? 'light' : 'success');
    setSaveError(null);
    setFavorites(next).catch(() => setSaveError('Couldn’t save. Try again.'));
  };

  const toggleTeam = () => {
    if (!onTeam && team.length >= TEAM_SIZE) return;
    const next = onTeam ? team.filter((t) => t !== p.id) : [...team, p.id];
    haptic(onTeam ? 'medium' : 'success');
    setSaveError(null);
    setTeam(next).catch(() => setSaveError('Couldn’t save your team. Try again.'));
  };

  const toggleShiny = () => {
    haptic(shiny ? 'light' : 'success');
    setShiny(!shiny);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <DetailHero
          pokemon={p}
          shiny={shiny}
          saved={saved}
          onBack={goBack}
          onToggleShiny={toggleShiny}
          onToggleSaved={toggleSaved}
          onLayout={(e) => setHeroHeight(e.nativeEvent.layout.height)}
        />

        <Sheet>
          <TeamButton onTeam={onTeam} teamFull={team.length >= TEAM_SIZE} color={deep} onPress={toggleTeam} />
          {saveError ? (
            <Text style={[text.subtitle, styles.saveError, { color: colors.bad }]} accessibilityLiveRegion="polite">
              {saveError}
            </Text>
          ) : null}

          <Section title="About">
            {about.data ? (
              <AboutSection
                about={about.data}
                pokemonId={p.id}
                type={p.types[0]}
                tree={evolution.data}
                onOpen={openFromTree}
              />
            ) : about.isError ? (
              <ErrorState {...errorCopy(about.error)} colors={colors} onRetry={() => void about.refetch()} />
            ) : (
              <AboutSkeleton />
            )}
          </Section>

          <Section title="Evolution chain">
            {evolution.data ? (
              <>
                <Note>{evolutionNote(evolution.data, p.id)}</Note>
                <EvolutionTree root={evolution.data} currentId={p.id} onOpen={openFromTree} />
              </>
            ) : evolution.isError ? (
              <ErrorState
                {...errorCopy(evolution.error)}
                colors={colors}
                onRetry={() => void evolution.refetch()}
              />
            ) : (
              <EvolutionTreeSkeleton />
            )}
          </Section>

          <Section title="Base stats">
            <StatBars stats={p.stats} color={typeColors[p.types[0]].c} />
          </Section>

          <Section title="Type matchups">
            <Note>How much damage each attack type does to {name}.</Note>
            <MatchupGroups types={p.types} />
          </Section>
        </Sheet>

        {heroHeight > 0 ? (
          <HeroArtwork pokemon={p} shiny={shiny} top={heroHeight - ART_BOTTOM - ART_SIZE} />
        ) : null}
      </ScrollView>
    </View>
  );
}

/** White sheet that overlaps the hero by 40 and rises in on entrance (DESIGN.md §7). */
function Sheet({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const rise = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!reduceMotion) rise.set(withDelay(80, withTiming(1, { duration: 500, easing: ease.out })));
  }, [rise, reduceMotion]);
  const style = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: [{ translateY: (1 - rise.value) * 44 }],
  }));
  return <Animated.View style={[styles.sheet, { backgroundColor: colors.bg }, style]}>{children}</Animated.View>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors, text } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[text.h3, styles.sectionTitle, { color: colors.ink }]} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Note({ children }: { children: ReactNode }) {
  const { colors, text } = useTheme();
  return <Text style={[text.subtitle, styles.note, { color: colors.muted }]}>{children}</Text>;
}

/** Shown only if the Pokémon isn't in the cache yet (e.g. opened from a link). */
function LoadingDetail({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} accessibilityState={{ busy: true }}>
      <View style={[styles.loadingHero, { paddingTop: insets.top + 18, backgroundColor: colors.field }]}>
        <IconButton accessibilityLabel="Back to list" onPress={onBack}>
          <Icon name="back" size={22} color={colors.ink} strokeWidth={2.4} />
        </IconButton>
        <Skeleton width="55%" height={40} style={styles.loadingName} />
        <Skeleton width={60} height={14} />
      </View>
      <View style={[styles.sheet, { backgroundColor: colors.bg }]}>
        <Skeleton width="100%" height={50} radius={16} />
        <View style={styles.section}>
          <EvolutionTreeSkeleton />
        </View>
        <View style={styles.section}>
          <StatBarsSkeleton />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 0 },
  centered: { flex: 1, justifyContent: 'center' },
  backFromError: { position: 'absolute', top: 56, left: layout.screenPadding },
  sheet: {
    marginTop: -40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 26,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 40,
  },
  saveError: { marginTop: 8 },
  section: { marginTop: layout.detailSectionGap - 4 },
  sectionTitle: { marginBottom: 4 },
  note: { marginBottom: 16 },
  loadingHero: { paddingHorizontal: layout.screenPadding, paddingBottom: 96, gap: 10 },
  loadingName: { marginTop: 22 },
});
