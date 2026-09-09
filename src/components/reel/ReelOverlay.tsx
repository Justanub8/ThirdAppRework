import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Typography } from '~/constants';
import { BaseText, FastImage } from '~/components/rn-components';
import { Avatar } from '~/components/avatar';
import { images } from '~/assets/images';
import { CommentIcon, MessageLightIcon, MoreIcon } from '~/assets/svgs';
import { SizedBox } from '~/components/separate-components';
import { IReel } from '~/interfaces/reel';
import LikeButton from '../buttons/LikeButton';
import BookmarkButton from '../buttons/BookmarkButton';
import { SheetManager } from 'react-native-actions-sheet';
import { useFollowMutation, useAuthStore } from '~/hooks';
import { RepostButton } from '../buttons';

type ReelOverlayProps = {
  reel: IReel;
  progress?: number;
};

const ReelOverlay = ({ reel, progress = 1 }: ReelOverlayProps) => {
  const [isFollowing, setIsFollowing] = useState(!!reel.isFollowing);
  const [likeCount, setLikeCount] = useState(reel.likeCount || 0);
  const [bookmarkCount, setBookmarkCount] = useState(reel.bookmarkCount || 0);
  const [repostCount, setRepostCount] = useState(reel.repostCount || 0);
  const currentUser = useAuthStore(state => state.user);
  const reelUserId = reel.user?.id;
  const currentUserId = currentUser?.id;
  const isOwnReel = !!currentUserId && currentUserId === reelUserId;
  const reelId = reel.id || '';
  const { createFollow, deleteFollow } = useFollowMutation();

  useEffect(() => {
    setIsFollowing(!!reel.isFollowing);
  }, [reelUserId, reel.isFollowing]);

  useEffect(() => {
    setLikeCount(reel.likeCount || 0);
  }, [reel.likeCount]);

  useEffect(() => {
    setBookmarkCount(reel.bookmarkCount || 0);
  }, [reel.bookmarkCount]);

  useEffect(() => {
    setRepostCount(reel.repostCount || 0);
  }, [reel.repostCount]);

  const handleFollowToggle = () => {
    if (!reelUserId) return;
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    if (isFollowing) {
      deleteFollow.mutate(reelUserId);
    } else {
      createFollow.mutate(reelUserId);
    }
  };

  return (
    <>
      <View style={[styles.bottomContainer, { bottom: 20 }]} pointerEvents="box-none">
        <View style={styles.bottomLeft} pointerEvents="box-none">
            <View style={styles.reelInformation} pointerEvents="box-none">
              <Avatar 
                url={reel.user?.avatarUrl || reel.user?.imageUrl} 
                size={36}
                id={reelUserId}
              />
              <BaseText color={'#ffffff'} typography={Typography.bodyBold.medium}>
                {reel.user?.username || 'user'}
              </BaseText>
              
              {!isOwnReel && reelUserId && (
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
            <LikeButton 
              size={32} 
              id={reelId} 
              type="Reel" 
              initialLiked={reel.isLiked} 
              inactiveColor="#ffffff" 
              activeColor="#F44336"
              onLikeToggle={(isLiked) => setLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1))}
            />
            <SizedBox height={4}/>
            <BaseText color={'#ffffff'} typography={Typography.bodyBold.small}>{likeCount}</BaseText>
          </View>

          <View style={styles.actionItem}>
            <CommentIcon height={32} width={32} color={'#ffffff'} 
              onPress={() => SheetManager.show('CommentSheet', {payload: {targetId: reelId, targetType: "Reel"}})}
            />
            <SizedBox height={4}/>
            <BaseText color={'#ffffff'} typography={Typography.bodyBold.small}>{reel.commentCount || 0}</BaseText>
          </View>

          <View style={styles.actionItem}>
            <BookmarkButton
              size={32}
              id={reelId}
              type="Reel"
              initialBookmarked={reel.isBookmarked}
              inactiveColor="#ffffff"
              activeColor="#ffffff"
              onBookmarkToggle={(isBookmarked) => setBookmarkCount(prev => isBookmarked ? prev + 1 : Math.max(0, prev - 1))}
            />
            <SizedBox height={4}/>
            <BaseText color={'#ffffff'} typography={Typography.bodyBold.small}>{bookmarkCount}</BaseText>
          </View>

          <View style={styles.actionItem}>
            <RepostButton
              size={32}
              id={reelId}
              type="Reel"
              initialReposted={reel.isReposted}
              inactiveColor="#ffffff"
              activeColor="#23d04e"
              onRepostToggle={(isReposted) => setRepostCount(prev => isReposted ? prev + 1 : Math.max(0, prev - 1))}
            />
            <SizedBox height={4}/>
            <BaseText color={'#ffffff'} typography={Typography.bodyBold.small}>{repostCount}</BaseText>
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

      {reel.media?.type === 'video' ? (
        <View style={[styles.progressBarContainer, { bottom: 4 }]}>
          <View style={[styles.progressBarActive, { width: `${progress * 100}%` }]} />
        </View>
      ) : null}
    </>
  );
};

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
  },
});

export default ReelOverlay;
