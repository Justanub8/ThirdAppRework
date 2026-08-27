import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native'
import React, { useState } from 'react'
import { RouteProp, useRoute } from '@react-navigation/native'
import { AuthenticatedStackParamList } from '~/navigation/types'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowToRight, CrossIcon, MenuIcon, MutedIcon, StickerIcon, TextAaIcon, UnmutedIcon } from '~/assets/svgs';
import { BaseText } from '~/components/rn-components';
import { Typography } from '~/constants';
import { Navigation } from '~/utils';
import { usePostMutation } from '~/hooks';
import { mediaApi } from '~/api';
import Video from 'react-native-video';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'CreatePost'>;

const CreatePost = () => {
  const { top } = useSafeAreaInsets();
  const route = useRoute<RouteProps>();
  const { uri = '', mediaType } = route.params || {};
  const [caption, setCaption] = useState('');
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { createPost } = usePostMutation();

  const isVideo = Boolean(
    mediaType === 'video' ||
    /\.(mp4|mov|avi|mkv|webm|3gp|m4v)(\?.*)?$/i.test(uri)
  );

  const handleCreatePost = async () => {
    if (!uri || createPost.isPending || isUploading) return;

    try {
      setIsUploading(true);
      const uploadRes = await mediaApi.uploadImage(uri);
      const uploadedUrl = uploadRes?.url || uri;
      const finalType = isVideo ? 'video' : 'image';

      await createPost.mutateAsync({
        caption: caption.trim() || (isVideo ? 'Video mới' : 'Bài viết mới'),
        media: [{ url: uploadedUrl, type: finalType }],
      });
      Alert.alert('Thành công', 'Đã tạo bài viết mới thành công!', [
        {
          text: 'OK',
          onPress: () => {
            Navigation.goToHomeScreen();
          },
        },
      ]);
    } catch (error: any) {
      console.log('Error creating post:', error);
      Alert.alert('Lỗi', error?.response?.data?.message || error?.message || 'Không thể tạo bài viết');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[{ paddingTop: top + 10 }, styles.toolBar]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => Navigation.pop()}>
            <CrossIcon width={24} height={24} color="#ffffff" />
          </TouchableOpacity> 

          <View style={styles.rightTools}>
            {isVideo && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setIsMuted(prev => !prev)}
              >
                {isMuted ? (
                  <MutedIcon width={20} height={20} color="#ffffff" />
                ) : (
                  <UnmutedIcon width={20} height={20} color="#ffffff" />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.iconButton, showCaptionInput && styles.activeIconButton]}
              onPress={() => setShowCaptionInput(prev => !prev)}
            >
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
      
      <View style={styles.imageWrapper}>
        {isVideo ? (
          <Video
            source={{ uri }}
            resizeMode="cover"
            style={styles.mainImage}
            repeat={true}
            paused={false}
            muted={isMuted}
          />
        ) : (
          <Image
            source={{ uri }}
            resizeMode="cover"
            style={styles.mainImage}
          />
        )}
        {showCaptionInput && (
          <View style={styles.captionOverlay}>
            <TextInput
              placeholder="Caption cho bài đăng"
              placeholderTextColor="#cccccc"
              value={caption}
              onChangeText={setCaption}
              style={styles.captionInput}
              autoFocus
              multiline
            />
          </View>
        )}
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.storyButton}
        >
          <BaseText typography={Typography.bodyBold.medium} color="#ffffff">
            Your Story
          </BaseText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.storyButton}
        >
          <BaseText typography={Typography.bodyBold.medium} color="#ffffff">
            Close Friends
          </BaseText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleCreatePost}
          disabled={createPost.isPending || isUploading}
        >
          {createPost.isPending || isUploading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <ArrowToRight width={24} height={24} color="#000000" />
          )}
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
  activeIconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  imageWrapper: {
    width: '100%',
    height: '84%',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
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
    color: '#ffffff',
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