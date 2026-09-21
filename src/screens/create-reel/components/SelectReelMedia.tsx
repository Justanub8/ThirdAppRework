import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CrossIcon, SettingIcon, CameraLightIcon } from '~/assets/svgs'
import { Navigation } from '~/utils'
import { BaseText } from '~/components/rn-components'
import { Theme, useTheme } from '~/hooks'
import { CustomHeader } from '~/components/headers'
import { Typography } from '~/constants'
import { FlashList } from '@shopify/flash-list'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_WIDTH = SCREEN_WIDTH / 3;
const GRID_HEIGHT = GRID_WIDTH * (SCREEN_HEIGHT / SCREEN_WIDTH);

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const SelectReelMedia = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  
  const fetchPhotos = async (after?: string) => {
    try{
      const res = await CameraRoll.getPhotos({
        first: 16,
        after: after,
        assetType: 'All',
      });

      const newPhotos = res.edges.map(edge => ({
        ...edge.node.image,
        type: edge.node.type,
        playableDuration: edge.node.image.playableDuration,
      }));
      setPhotos((prev: any[]) => after ? [...prev, ...newPhotos] : newPhotos);
      setHasNextPage(res.page_info.has_next_page);
      setEndCursor(res.page_info.end_cursor);
    }catch(error){
      console.log('error fetching story media', error);
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, []);

  const isSelectedVideo = Boolean(
    selectedPhoto?.playableDuration ||
    selectedPhoto?.type?.startsWith('video') ||
    /\.(mp4|mov|avi|mkv|webm|3gp|m4v)(\?.*)?$/i.test(selectedPhoto?.uri || '')
  );


  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <CustomHeader
        title='Thước phim mới'
        LeftComponent={<CrossIcon width={32} height={32} onPress={() => Navigation.goBack()}/>}
        RightComponent={<SettingIcon width={32} height={32} onPress={() => Navigation.goBack()}/>}
      /> 
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.albumSelector}>
          <BaseText typography={Typography.bodyBold.medium}>
            Gần đây
          </BaseText>
        </TouchableOpacity>
        <TouchableOpacity>
          <CameraLightIcon width={24} height={24}/>
        </TouchableOpacity>
      </View>

      <FlashList
        data={photos}
        numColumns={3}
        keyExtractor={(item: any, index) => item.uri + index}
        onEndReached={() => {
          if (hasNextPage && endCursor) fetchPhotos(endCursor);
        }}
        onEndReachedThreshold={0.5}
        renderItem={({ item }: { item: any }) => {
          const isSelected = selectedPhoto?.uri === item.uri;
          const isVideo = Boolean(
            item.playableDuration ||
            item.type?.startsWith('video') ||
            /\.(mp4|mov|avi|mkv|webm|3gp|m4v)(\?.*)?$/i.test(item.uri)
          );
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedPhoto(item);
                if (item?.uri) {
                  Navigation.goToCreateReel(item.uri, isVideo ? 'video' : 'image');
                }
              }}
              style={[styles.gridItem, isSelected && styles.gridItemSelected]}
            >
              <Image
                source={{ uri: item.uri }}
                style={styles.gridImage}
                resizeMode="contain"
              />
              {isVideo && (
                <View style={styles.videoBadge}>
                  <BaseText typography={Typography.bodyRegular.xSmall} color={theme.white}>
                    {formatDuration(item.playableDuration) || 'Video'}
                  </BaseText>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  )
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  option: {
    backgroundColor: '#1F1F1F',
    height: 80,
    width: '30%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 32,
  },
    toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderColor: theme.border,
    borderBottomWidth: 1,
  },
  albumSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridItem: {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    position: 'relative',
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.background,
    overflow: 'hidden',
  },
  gridItemSelected: {
    opacity: 0.5,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1F1F1F',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: theme.overlaySubtle,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
})
export default SelectReelMedia