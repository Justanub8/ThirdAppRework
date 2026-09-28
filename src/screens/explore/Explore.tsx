import {  StyleSheet, View } from 'react-native';
import React  from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryInput } from '~/components/inputs';
import { SearchLightIcon } from '~/assets/svgs';
import { Theme, useTheme } from '~/hooks';

const Explore = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.searchHeader}>
        <PrimaryInput
          placeholder="Tìm kiếm"
          LeftComponent={SearchLightIcon}
        />
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  searchHeader: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});

export default Explore;