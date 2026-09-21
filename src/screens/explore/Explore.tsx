import { StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryInput } from '~/components/inputs';
import { SearchLightIcon } from '~/assets/svgs';
import { useTheme } from '~/hooks';
import VideoReel from '~/components/reel/VideoReel';
import PreviewReel from '~/components/reel/PreviewVideoReel';

const Explore = () => {
  const { theme } = useTheme();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <PrimaryInput
        placeholder='Tìm kiếm'
        LeftComponent={SearchLightIcon}
      />
      {/* <PreviewReel/> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
  },
});

export default Explore;