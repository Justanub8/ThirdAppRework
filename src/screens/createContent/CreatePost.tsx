import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { RouteProp, useRoute } from '@react-navigation/native'
import { AuthenticatedStackParamList } from '~/navigation/types'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowToRight, CrossIcon, MenuIcon, MutedIcon, StickerIcon, TextAaIcon, UnmutedIcon } from '~/assets/svgs';
import { BaseText } from '~/components/rn-components';
import { Typography } from '~/constants';
import { Navigation } from '~/utils';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'CreatePost'>;

const CreatePost = () => {
  const { top } = useSafeAreaInsets();
  const route = useRoute<RouteProps>();
  const { uri } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[{ paddingTop: top + 10 }, styles.toolBar]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => Navigation.pop()}>
            <CrossIcon width={32} height={32} color="#ffffff" />
          </TouchableOpacity> 

          <View style={styles.rightTools}>
            <TouchableOpacity style={styles.iconButton}>
              <UnmutedIcon width={20} height={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <TextAaIcon width={16} height={16} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <StickerIcon width={20} height={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MenuIcon width={20} height={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <Image
        source={{ uri }}
        resizeMode="cover"
        style={styles.mainImage}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.storyButton}>
          <BaseText typography={Typography.bodyBold.medium} color="#ffffff">Your Story</BaseText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.storyButton}>
          <BaseText typography={Typography.bodyBold.medium} color="#ffffff">Close Friends</BaseText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton}>
          <ArrowToRight width={32} height={32} color="#000000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  toolBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rightTools: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  mainImage: {
    width: '100%',
    height: '84%',
    borderRadius: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  storyButton: {
    backgroundColor: '#333333',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    height: 44,
  },
  nextButton: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
});

export default CreatePost;