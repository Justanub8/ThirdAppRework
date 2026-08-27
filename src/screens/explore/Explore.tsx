import { StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryInput } from '~/components/inputs';
import { SearchLightIcon } from '~/assets/svgs';

const Explore = () => {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <PrimaryInput
        placeholder='Tìm kiếm'
        LeftComponent={SearchLightIcon}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
  },
});

export default Explore;