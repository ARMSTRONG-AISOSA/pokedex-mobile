import { StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/theme/useTheme';

/** Search input (DESIGN.md §4): 48 tall, icon on the left. */
export function SearchField({ value, onChangeText }: { value: string; onChangeText: (text: string) => void }) {
  const { colors, text } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.icon} pointerEvents="none">
        <Icon name="search" size={20} color={colors.muted} />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search by name or number"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Search Pokémon"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
        style={[
          text.body,
          styles.input,
          { backgroundColor: colors.field, borderColor: colors.line, color: colors.ink },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'center' },
  icon: { position: 'absolute', left: 14, zIndex: 1 },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: 44,
    paddingRight: 14,
    paddingVertical: 0,
  },
});
