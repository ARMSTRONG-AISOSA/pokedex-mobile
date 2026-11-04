import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { ease } from '@/theme/motion';
import { brand } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

const BALL = 150;
/** The ball is drawn in a 100-unit box; the draft's lid/base offsets are in those units. */
const UNIT = BALL / 100;

// Timings from DESIGN.md §7 (ms).
const DROP = 450;
const WOBBLE_DELAY = 450;
const OPEN_DELAY = 1050;
const OPEN = 400;
const GLOW = 550;
const WORD_DELAY = 1200;
const WORD = 500;
const EXIT_DELAY = 2000;
const EXIT = 400;
const SKIP_FADE = 150;

const wobbleEase = Easing.inOut(Easing.ease);
const openEase = Easing.bezier(0.5, 0, 0.2, 1);
const wordEase = Easing.bezier(0.2, 0.8, 0.2, 1);

let playedThisLaunch = false;

/**
 * True until the launch animation has finished once. It lives in memory only,
 * so it plays again after a cold start but never on tab switches or when the
 * app comes back from the background (DESIGN.md §5.6).
 */
export function shouldPlayLaunch() {
  return !playedThisLaunch;
}

/**
 * Launch screen (DESIGN.md §5.6, §7): a Poké Ball drops in, wobbles, splits
 * open with a flash, the wordmark appears, then the screen fades out (~2.4 s).
 * Tap anywhere to skip. The caller skips it entirely for reduced motion.
 */
export function LaunchAnimation({ onDone }: { onDone: () => void }) {
  const drop = useSharedValue(0);
  const rotate = useSharedValue(0);
  const open = useSharedValue(0);
  const belt = useSharedValue(1);
  const glow = useSharedValue(0);
  const word = useSharedValue(0);
  const screen = useSharedValue(1);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    playedThisLaunch = true;
    onDone();
  };

  useEffect(() => {
    drop.set(withTiming(1, { duration: DROP, easing: ease.overshoot }));
    // Rotate 0 → −14° → 12° → −6° → 3° → 0 over 600 ms (keyframes at 20/45/70/85%).
    rotate.set(
      withDelay(
        WOBBLE_DELAY,
        withSequence(
          withTiming(-14, { duration: 120, easing: wobbleEase }),
          withTiming(12, { duration: 150, easing: wobbleEase }),
          withTiming(-6, { duration: 150, easing: wobbleEase }),
          withTiming(3, { duration: 90, easing: wobbleEase }),
          withTiming(0, { duration: 90, easing: wobbleEase }),
        ),
      ),
    );
    open.set(withDelay(OPEN_DELAY, withTiming(1, { duration: OPEN, easing: openEase })));
    belt.set(withDelay(OPEN_DELAY, withTiming(0, { duration: 150 })));
    glow.set(withDelay(OPEN_DELAY, withTiming(1, { duration: GLOW, easing: Easing.out(Easing.ease) })));
    word.set(withDelay(WORD_DELAY, withTiming(1, { duration: WORD, easing: wordEase })));
    screen.set(
      withDelay(
        EXIT_DELAY,
        withTiming(0, { duration: EXIT }, (done) => {
          if (done) scheduleOnRN(finish);
        }),
      ),
    );
    // Runs once on mount; `finish` only touches refs and the latest onDone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    if (finished.current) return;
    cancelAnimation(screen);
    screen.set(
      withTiming(0, { duration: SKIP_FADE }, (done) => {
        if (done) scheduleOnRN(finish);
      }),
    );
  };

  const screenStyle = useAnimatedStyle(() => ({ opacity: screen.value }));
  const dropStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, drop.value * 2),
    transform: [{ translateY: -130 * (1 - drop.value) }, { scale: 0.7 + 0.3 * drop.value }],
  }));
  const rotateStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));
  const lidStyle = useAnimatedStyle(() => ({
    opacity: 1 - open.value,
    transform: [{ translateY: -34 * UNIT * open.value }, { rotate: `${-20 * open.value}deg` }],
  }));
  const baseStyle = useAnimatedStyle(() => ({
    opacity: 1 - open.value,
    transform: [{ translateY: 30 * UNIT * open.value }, { rotate: `${6 * open.value}deg` }],
  }));
  const beltStyle = useAnimatedStyle(() => ({ opacity: belt.value }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value > 0 ? 0.95 * (1 - glow.value) : 0,
    transform: [{ scale: 0.3 + 2.9 * glow.value }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.value,
    letterSpacing: 3.84 - 5.28 * word.value,
    transform: [{ scale: 0.9 + 0.1 * word.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.screen, screenStyle]}>
      <StatusBar style="light" />
      <Pressable
        style={[StyleSheet.absoluteFill, styles.center]}
        onPress={skip}
        accessibilityRole="button"
        accessibilityLabel="Skip intro">
        <View style={styles.stage} pointerEvents="none">
          <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
            <Svg width={BALL} height={BALL} viewBox="0 0 100 100">
              <Defs>
                <RadialGradient id="glow" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
                  <Stop offset="0" stopColor="#ffffff" stopOpacity={1} />
                  <Stop offset="0.68" stopColor="#ffffff" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx={50} cy={50} r={50} fill="url(#glow)" />
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.ball, dropStyle]}>
            <Animated.View style={[StyleSheet.absoluteFill, rotateStyle]}>
              <Animated.View style={[StyleSheet.absoluteFill, lidStyle]}>
                <Svg width={BALL} height={BALL} viewBox="0 0 100 100">
                  <Path d="M4 50a46 46 0 0 1 92 0z" fill={brand.ballTop} />
                </Svg>
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFill, baseStyle]}>
                <Svg width={BALL} height={BALL} viewBox="0 0 100 100">
                  <Path d="M4 50a46 46 0 0 0 92 0z" fill={brand.ballBottom} />
                </Svg>
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFill, beltStyle]}>
                <Svg width={BALL} height={BALL} viewBox="0 0 100 100">
                  <Rect x={4} y={46} width={92} height={8} fill={brand.belt} />
                  <Circle cx={50} cy={50} r={14} fill={brand.ballBottom} stroke={brand.belt} strokeWidth={6} />
                </Svg>
              </Animated.View>
            </Animated.View>
          </Animated.View>

          <View style={styles.wordBox}>
            <Animated.Text style={[styles.word, wordStyle]} numberOfLines={1}>
              Pokédex
            </Animated.Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: brand.launchBg, zIndex: 10 },
  center: { alignItems: 'center', justifyContent: 'center' },
  stage: { width: BALL, height: BALL },
  ball: { width: BALL, height: BALL },
  // Wider than the ball so the wordmark can sit centered where the ball was.
  wordBox: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -120,
    right: -120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: { color: brand.wordmark, fontFamily: fonts.display800, fontSize: 48 },
});
