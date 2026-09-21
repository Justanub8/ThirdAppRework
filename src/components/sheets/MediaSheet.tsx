import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import ActionSheet, { SheetProps, SheetManager } from 'react-native-actions-sheet';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Theme, useTheme } from '~/hooks';
import { BaseText, FastImage } from '../rn-components';
import { PlayIcon } from '~/assets/svgs';
import { Typography } from '~/constants';
import { FlashList } from '@shopify/flash-list';
const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SPACING = 2;
const ITEM_SIZE = (width - ITEM_SPACING * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

export interface SelectedChatMedia {
  uri: string;
  type: 'image' | 'video';
  filename?: string | null;
  extension?: string | null;
}

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const MediaSheet = (props: SheetProps<"MediaSheet">) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);

  const fetchPhotos = useCallback(async (after?: string) => {
    try {
      if (!after) setIsLoading(true);
      const res = await CameraRoll.getPhotos({
        first: 30,
        after,
        assetType: 'All',
        include: ['filename', 'fileExtension', 'playableDuration'],
      });

      const newPhotos = res.edges.map(edge => ({
        uri: edge.node.image.uri,
        type: edge.node.type,
        filename: edge.node.image.filename,
        extension: edge.node.image.extension,
        playableDuration: edge.node.image.playableDuration,
      }));

      setPhotos(prev => (after ? [...prev, ...newPhotos] : newPhotos));
      setHasNextPage(res.page_info.has_next_page);
      setEndCursor(res.page_info.end_cursor);
    } catch (error) {
      console.log('Error fetching photos in MediaSheet:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleLoadMore = () => {
    if (hasNextPage && endCursor && !isLoading) {
      fetchPhotos(endCursor);
    }
  };

  const handleSelectMedia = (selected: SelectedChatMedia) => {
    props.payload?.onSelectMedia?.(selected);
    SheetManager.hide(props.sheetId, { payload: selected });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isVideo =
      Boolean(item.playableDuration) ||
      item.type?.startsWith('video') ||
      item.type === 'video' ||
      /\.(mp4|mov|avi|mkv|webm|3gp|m4v)(\?.*)?$/i.test(item.uri || '') ||
      /\.(mp4|mov|avi|mkv|webm|3gp|m4v)$/i.test(item.filename || '');

    return (
      <TouchableOpacity
        style={styles.gridItem}
        activeOpacity={0.7}
        onPress={() => {
          handleSelectMedia({
            uri: item.uri,
            type: isVideo ? 'video' : 'image',
            filename: item.filename,
            extension: item.extension,
          });
        }}
      >
        <FastImage source={{ uri: item.uri }} style={styles.thumbnail} resizeMode="cover" />
        {isVideo ? (
          <View style={styles.videoBadge}>
            <PlayIcon width={12} height={12} color="#FFFFFF" />
            {item.playableDuration ? (
              <BaseText typography={Typography.bodyRegular.small} color="#FFFFFF" style={styles.durationText}>
                {formatDuration(item.playableDuration)}
              </BaseText>
            ) : null}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <ActionSheet
      id={props.sheetId}
      gestureEnabled={true}
      closeOnTouchBackdrop={true}
      closeOnPressBack={true}
      indicatorStyle={styles.indicator}
      containerStyle={styles.container}
      snapPoints={[60, 100]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <BaseText style={styles.title}>Chọn ảnh hoặc video</BaseText>
        </View>

        {isLoading && photos.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.black} />
          </View>
        ) : (
          <FlashList
            data={photos}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.uri}_${index}`}
            numColumns={COLUMN_COUNT}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoading && photos.length > 0 ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={theme.black} />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </ActionSheet>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    indicator: {
      width: 44,
      height: 5,
      backgroundColor: theme.placeholder,
      borderRadius: 3,
      marginTop: 8,
    },
    container: {
      height: '70%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: theme.sheet,
    },
    contentContainer: {
      flex: 1,
    },
    header: {
      borderBottomColor: theme.divider,
      borderBottomWidth: 1,
      paddingBottom: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginVertical: 6,
      textAlign: 'center',
    },
    columnWrapper: {
      gap: ITEM_SPACING,
      marginBottom: ITEM_SPACING,
    },
    gridItem: {
      width: ITEM_SIZE,
      height: ITEM_SIZE,
      position: 'relative',
    },
    thumbnail: {
      width: '100%',
      height: '100%',
    },
    videoBadge: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      borderRadius: 4,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 5,
      paddingVertical: 2,
      gap: 3,
    },
    durationText: {
      fontSize: 11,
      lineHeight: 14,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 40,
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
    },
  });

export default MediaSheet;
export { MediaSheet };