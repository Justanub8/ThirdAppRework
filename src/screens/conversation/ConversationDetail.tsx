import { View, StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import { BaseText } from '~/components/rn-components';
import { useTheme, Theme } from '~/hooks';

const ConversationDetail = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <BaseText style={styles.text}>ConversationDetail</BaseText>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: theme.text,
    },
  });

export default ConversationDetail;
