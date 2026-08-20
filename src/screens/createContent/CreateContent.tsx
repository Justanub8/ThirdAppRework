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
import { COLORS, Typography } from '~/constants'

const { width } = Dimensions.get('window');
const GRID_SIZE = width / 4;

const CreateContent = () => {
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

      const newPhotos = res.edges.map(edge => edge.node.image);
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
    console.log(selectedPhoto)
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <CustomHeader
        title="Bài viết mới"
        LeftComponent={<CrossIcon width={32} height={32} onPress={() => Navigation.pop()} />}
        RightComponent={
          <TouchableOpacity onPress={() => Navigation.goToCreatePost(selectedPhoto.uri)}>
            <BaseText typography={Typography.bodyBold.large} color={COLORS.blue}>
              Tiếp
            </BaseText>
          </TouchableOpacity>
        }
      />

      <View style={styles.previewContainer}>
        {selectedPhoto && (
          <Image
            source={{ uri: selectedPhoto.uri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
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
              </TouchableOpacity>
            );
          }}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    width: width,
    height: width,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewImage: {
    width: '95%',
    height: '95%',
    borderRadius: 8
  },
  bottomSheetBackground: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleIndicator: {
    width: 40,
    height: 4,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderColor: COLORS.border,
    borderBottomWidth: 1
  },
  albumSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridItem: {
    width: GRID_SIZE,
    height: GRID_SIZE,
  },
  gridItemSelected: {
    opacity: 0.5,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});

export default CreateContent;
