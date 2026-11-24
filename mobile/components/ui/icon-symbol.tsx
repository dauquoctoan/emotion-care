import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { type StyleProp, type TextStyle } from 'react-native';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

const SF_TO_IONICONS: Record<string, IoniconsName> = {
  'house.fill': 'home',
  'house': 'home-outline',
  'list.bullet': 'list',
  'pencil': 'create-outline',
  'paperplane.fill': 'paper-plane',
  'chevron.left.forwardslash.chevron.right': 'code-slash',
  'chevron.right': 'chevron-forward',
  'sparkles': 'sparkles',
  'compass': 'compass-outline',
  'heart': 'heart',
  'copy': 'copy-outline',
  'settings': 'settings-outline',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
  weight?: string;
}) {
  const iconName = SF_TO_IONICONS[name] || (name as IoniconsName) || 'help-outline';
  return <Ionicons color={color} size={size} name={iconName} style={style} />;
}
