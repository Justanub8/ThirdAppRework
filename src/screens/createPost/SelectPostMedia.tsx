import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  Image 
} from 'react-native'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import { CustomHeader } from '~/components/headers'
import { CameraLightIcon, CrossIcon } from '~/assets/svgs'
import { Navigation } from '~/utils'
import { BaseText } from '~/components/rn-components'
import { Typography } from '~/constants'
import { useTheme, Theme } from '~/hooks'

const { width } = Dimensions.get('window');
const GRID_SIZE = width / 4;

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const SelectPostMedia = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '80%'], []);
  const fetchPhotos = async (after?: string) => {
    try {
      const res = await CameraRoll.getPhotos({
        first: 32,
        after: after,
        assetType: 'All',
      });

      const newPhotos = res.edges.map(edge => ({
        ...edge.node.image,
        type: edge.node.type,
        playableDuration: edge.node.image.playableDuration,
      }));
      setPhotos(prev => after ? [...prev, ...newPhotos] : newPhotos);
      setHasNextPage(res.page_info.has_next_page);
      setEndCursor(res.page_info.end_cursor);

      if (!after && newPhotos.length > 0) {
        setSelectedPhoto(newPhotos[0]);
      }
    } catch (error) {
      console.log('Error fetching photos:', error);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const isSelectedVideo = Boolean(
    selectedPhoto?.playableDuration ||
    selectedPhoto?.type?.startsWith('video') ||
    /\.(mp4|mov|avi|mkv|webm|3gp|m4v)(\?.*)?$/i.test(selectedPhoto?.uri || '')
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <CustomHeader
        title="Bài viết mới"
        LeftComponent={<CrossIcon width={32} height={32} onPress={() => Navigation.pop()} />}
        RightComponent={
          <TouchableOpacity 
            onPress={() => {
              if (selectedPhoto?.uri) {
                Navigation.goToCreatePost(selectedPhoto.uri, isSelectedVideo ? 'video' : 'image');
              }
            }}
          >
            <BaseText typography={Typography.bodyBold.large} color={theme.blue}>
              Tiếp
            </BaseText>
          </TouchableOpacity>
        }
      />

      <View style={styles.previewContainer}>
        {selectedPhoto && (
          <View style={styles.previewWrapper}>
            <Image
              source={{ uri: selectedPhoto.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            {isSelectedVideo && (
              <View style={styles.previewVideoBadge}>
                <BaseText typography={Typography.bodySemiBold.small} color={theme.white}>
                  {formatDuration(selectedPhoto.playableDuration) || 'VIDEO'}
                </BaseText>
              </View>
            )}
          </View>
        )}
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.bottomSheetBackground}
      >
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

        <BottomSheetFlatList
          data={photos}
          numColumns={4}
          keyExtractor={(item, index) => item.uri + index}
          onEndReached={() => {
            if (hasNextPage && endCursor) fetchPhotos(endCursor);
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => {
            const isSelected = selectedPhoto?.uri === item.uri;
            const isVideo = Boolean(
              item.playableDuration ||
              item.type?.startsWith('video') ||
              /\.(mp4|mov|avi|mkv|webm|3gp|m4v)(\?.*)?$/i.test(item.uri)
            );
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedPhoto(item)}
                style={[styles.gridItem, isSelected && styles.gridItemSelected]}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.gridImage}
                  resizeMode="cover"
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
      </BottomSheet>
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  previewContainer: {
    width: width,
    height: width,
    backgroundColor: theme.darkBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewWrapper: {
    width: '95%',
    height: '95%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  previewVideoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: theme.overlayDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bottomSheetBackground: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: theme.background,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: theme.divider,
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
    width: GRID_SIZE,
    height: GRID_SIZE,
    position: 'relative',
  },
  gridItemSelected: {
    opacity: 0.5,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
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
});

export default SelectPostMedia;
