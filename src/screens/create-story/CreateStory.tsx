import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native'
import React, { useState, useEffect} from 'react'
import { AuthenticatedStackParamList } from '~/navigation/types'
import { RouteProp, useRoute } from '@react-navigation/native';
import { Theme, useStoryMutation, useTheme } from '~/hooks';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CrossIcon, MutedIcon, UnmutedIcon, TextAaIcon, StickerIcon, MenuIcon, ArrowToRight, StarIcon, MusicIcon, ScribbleIcon } from '~/assets/svgs';
import { Navigation } from '~/utils';
import { BaseText } from '~/components/rn-components';
import { Typography } from '~/constants';
import CreateStoryVideo from './components/CreateStoryVideo';
import { mediaApi } from '~/api';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'CreateStory'>;

const CreateStory = () => {
    const { top } = useSafeAreaInsets();
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const route = useRoute<RouteProps>();
    const { uri, mediaType } = route.params;
    const [isMuted, setIsMuted] = useState(false);
    const [hasVideoError, setHasVideoError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { createStory } = useStoryMutation();
    useEffect(() => {
        setHasVideoError(false);
      }, [uri]);
    
      const isVideo = Boolean(
        mediaType === 'video' ||
        /\.(mp4|mov|avi|mkv|webm|3gp|m4v)(\?.*)?$/i.test(uri)
      );

    const handleCreateStory = async () => {
        if (!uri || createStory.isPending || isUploading) return;
        
        try {
            setIsUploading(true);
            const uploadRes = await mediaApi.uploadImage(uri, undefined, undefined, isVideo);
            const uploadedUrl = uploadRes?.url || uri;
            const mediaId = uploadRes?.media?.id;
            const finalType = isVideo ? 'video' : 'image';
    
            await createStory.mutateAsync({
                mediaId,
                mediaUrl: uploadedUrl,
                type: finalType,
            });
            Alert.alert('Thành công', 'Đã tạo tin mới thành công!', [
            {
                text: 'OK',
                onPress: () => {
                Navigation.goToHomeScreen();
                },
            },
            ]);
        } catch (error: any) {
            console.log('Error creating story:', error);
            Alert.alert('Lỗi', error?.response?.data?.message || error?.message || 'Không thể tạo tin');
        } finally {
            setIsUploading(false);
        }
    }
  return (
    <SafeAreaView style={styles.container}>
      <View style={[{ paddingTop: top + 10 }, styles.toolBar]} pointerEvents="box-none">
        <View style={styles.headerRow} pointerEvents="box-none">
          <TouchableOpacity style={styles.iconButton} onPress={() => Navigation.pop()}>
            <CrossIcon width={24} height={24} color={theme.white} />
          </TouchableOpacity>  
          <View style={styles.rightTools} pointerEvents="box-none">
            <TouchableOpacity style={styles.iconButton}>
                <TextAaIcon width={20} height={20} color={theme.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
                <StickerIcon width={20} height={20} color={theme.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
                <StarIcon width={20} height={20} color={theme.white}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
                <MusicIcon width={20} height={20} color={theme.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
                <ScribbleIcon width={20} height={20} color={theme.white} />
            </TouchableOpacity>
        </View>
        </View>
      </View>
      
      <View style={styles.imageWrapper}>
        {isVideo ? (
          hasVideoError ? (
            <View style={[styles.mainImage, styles.errorContainer]}>
              <BaseText color={theme.white} typography={Typography.bodyMedium.medium}>
                Không thể phát nội dung
              </BaseText>
            </View>
          ) : (
            <CreateStoryVideo
              uri={uri}
              style={styles.mainImage}
              isMuted={isMuted}
              onError={() => setHasVideoError(true)}
            />
          )
        ) : (
          <Image
            source={{ uri }}
            resizeMode="contain"
            style={styles.mainImage}
          />
        )}
        
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.storyButton}
        >
          <BaseText typography={Typography.bodyBold.medium} color={theme.white}>
            Your Story
          </BaseText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.storyButton}
        >
          <BaseText typography={Typography.bodyBold.medium} color={theme.white}>
            Close Friends
          </BaseText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.nextButton}
          
        >
          {isUploading || createStory.isPending ? (
            <ActivityIndicator size="small" color={theme.black} />
          ) : (
            <ArrowToRight width={24} height={24} color={theme.black} onPress={() => handleCreateStory()} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const getStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.black,
    },
    toolBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 16,
        alignItems: 'flex-start'
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
    },
    rightTools: {
        flexDirection: 'column',
        gap: 8,
    },
    iconButton: {
        backgroundColor: theme.overlayMedium,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
    },
    activeIconButton: {
        backgroundColor: theme.overlayLight,
        borderWidth: 1,
        borderColor: theme.white,
    },
    imageWrapper: {
        width: '100%',
        height: '84%',
        position: 'relative',
        backgroundColor: '#1F1F1F',
        borderRadius: 24,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainImage: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    errorContainer: {
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captionOverlay: {
        position: 'absolute',
        top: '40%',
        left: 24,
        right: 24,
        borderRadius: 16,
        padding: 16,
    },
    captionInput: {
        color: theme.white,
        fontSize: 16,
        textAlign: 'center',
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
        backgroundColor: theme.darkSurface,
        borderRadius: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        height: 44,
    },
    nextButton: {
        backgroundColor: theme.white,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        width: 44,
        height: 44,
    }, 
})

export default CreateStory