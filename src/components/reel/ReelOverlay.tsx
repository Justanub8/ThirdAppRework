import { View, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Typography, commonStyles } from '~/constants'
import { BaseText, FastImage } from '~/components/rn-components'
import { images } from '~/assets/images'
import { CommentIcon, HeartIcon, MessageLightIcon, MoreIcon, NotificationIcon, RepostIcon } from '~/assets/svgs'
import { SizedBox } from '~/components/separate-components'
import { IReel } from '~/interfaces/reel'
import LikeButton from '../buttons/LikeButton'
import { SheetManager } from 'react-native-actions-sheet'
import { useFollowMutation, useAuthStore } from '~/hooks'

type ReelOverlayProps = {
  reel: IReel;
  progress?: number;
}

const ReelOverlay = ({ reel, progress = 1 }: ReelOverlayProps) => {
  const [isFollowing, setIsFollowing] = useState(!!reel.isFollowing);
  const currentUser = useAuthStore(state => state.user);
  const isOwnReel = currentUser?._id === reel.user?._id;
  const { createFollow, deleteFollow } = useFollowMutation();

  useEffect(() => {
    setIsFollowing(!!reel.isFollowing);
  }, [reel.user?._id, reel.isFollowing]);

  const handleFollowToggle = () => {
    if (!reel.user?._id) return;
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    if (isFollowing) {
      deleteFollow.mutate(reel.user._id);
    } else {
      createFollow.mutate(reel.user._id);
    }
  };

  return (
    <>
      <View style={[styles.bottomContainer, { bottom: 20 }]} pointerEvents="box-none">
        <View style={styles.bottomLeft} pointerEvents="box-none">
            <View style={styles.reelInformation} pointerEvents="box-none">
              <FastImage source={images.avater_random} style={styles.avatar}/>
              <BaseText color={'#ffffff'} typography={Typography.bodyBold.medium}>
                {reel.user?.username || 'user'}
              </BaseText>
              
              {!isOwnReel && reel.user?._id && (
                <TouchableOpacity 
                  style={[styles.followButton, isFollowing && styles.followingButton]}
                  onPress={handleFollowToggle}
                >
                  <BaseText color={'#ffffff'} typography={Typography.bodyBold.small}>
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </BaseText>
                </TouchableOpacity>
              )}
            </View>
            <SizedBox height={12} />
            <BaseText color={'#ffffff'} typography={Typography.bodyRegular.medium} numberOfLines={2}>
              {reel.caption}
            </BaseText>
        </View>

        <View style={styles.bottomRight} pointerEvents="box-none">
          <View style={styles.actionItem}>
            <LikeButton size={32} id={reel._id} type="Reel" initialLiked={reel.isLiked} inactiveColor="#ffffff" activeColor="#F44336" />
            <SizedBox height={4}/>
            <BaseText color={'#ffffff'} typography={Typography.bodyBold.small}>{reel.likeCount || 0}</BaseText>
          </View>

          <View style={styles.actionItem}>
            <CommentIcon height={32} width={32} color={'#ffffff'} 
              onPress={() => SheetManager.show('CommentSheet', {payload: {targetId: reel._id, targetType: "Reel"}})}
            />
            <SizedBox height={4}/>
            <BaseText color={'#ffffff'} typography={Typography.bodyBold.small}>{reel.commentCount || 0}</BaseText>
          </View>

          <View style={styles.actionItem}>
            <RepostIcon height={32} width={32} color={'#ffffff'} />
            <SizedBox height={4}/>
            <BaseText color={'#ffffff'} typography={Typography.bodyBold.small}>{reel.repostCount || 0}</BaseText>
          </View>

          <View style={styles.actionItem}>
            <MessageLightIcon height={32} width={32} color={'#ffffff'} />
            <SizedBox height={4}/>
            <BaseText color={'#ffffff'} typography={Typography.bodyBold.small}>{reel.shareCount || 0}</BaseText>
          </View>

          <View style={styles.actionItem}>
            <MoreIcon height={28} width={28} color={'#ffffff'} />
          </View>

          <FastImage source={images.avater_random} style={styles.audioTrack} />
        </View>
      </View>

      {/* Progress Bar */}
      {reel.media?.type === 'video' ? (
        <View style={[styles.progressBarContainer, { bottom: 4 }]}>
          <View style={[styles.progressBarActive, { width: `${progress * 100}%` }]} />
        </View>
      ) : 
      null }
      
    </>
  )
}

const styles = StyleSheet.create({
  bottomContainer: {
    flexDirection: 'row',
    position: 'absolute',
    left: 16,
    right: 12,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  bottomLeft: {
    flex: 1,
    paddingRight: 32,
    justifyContent: 'flex-end',
  },
  reelInformation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
  }, 
  followButton: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  bottomRight: {
    alignItems: 'center',
    gap: 20,
  },
  actionItem: {
    alignItems: 'center',
  },
  audioTrack: {
    height: 32,
    width: 32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginTop: 8,
  },
  progressBarContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    zIndex: 10,
  },
  progressBarActive: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 1,
  }
})

export default ReelOverlay
