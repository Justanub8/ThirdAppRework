import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ViewToken,
} from 'react-native';
import React, { useState, useRef, useCallback, useMemo } from 'react';
import millify from 'millify';
import { Typography } from '~/constants';
import { BaseText } from '~/components/rn-components';
import { CommentIcon, MoreIcon, MessageLightIcon } from '~/assets/svgs';
import InteractNum from '~/components/interact/InteractNum';
import { FastImage } from '~/components/rn-components';
import { Avatar } from '~/components/avatar';
import { IPost } from '~/interfaces/post';
import { SheetManager } from 'react-native-actions-sheet';
import LikeButton from '~/components/buttons/LikeButton';
import BookmarkButton from '~/components/buttons/BookmarkButton';
import { IMedia } from '~/interfaces';
import { Navigation } from '~/utils';
import { timeAgo } from '~/utils/timeUtils';
import { useFollowMutation, useTheme, Theme } from '~/hooks';
import { useAuthStore, useFeedStore } from '~/store';
import { RepostButton } from '~/components/buttons';
import PostVideoItem from '~/components/post/components/PostVideoItem';

const ACTION_ICON_SIZE = 26;

interface PostMediaItemProps {
  item: IMedia;
  isPaused: boolean;
  windowWidth: number;
}

const PostMediaItem = React.memo(
  ({ item, isPaused, windowWidth }: PostMediaItemProps) => {
    return (
      <View style={[styles.mediaItem, { width: windowWidth }]}>
        {item.type === 'video' ? (
          <PostVideoItem url={item?.url} isPaused={isPaused} />
        ) : (
          <FastImage
            source={{ uri: item?.url }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
      </View>
    );
  },
);

const Post = ({
  post,
  isActive: isActiveProp,
}: {
  post: IPost;
  /** Overrides the home-feed active post when provided. */
  isActive?: boolean;
}) => {
  const { theme } = useTheme();
  const themed = useMemo(() => getThemedStyles(theme), [theme]);
  const [expanded, setExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canExpand, setCanExpand] = useState(false);
  const windowWidth = Dimensions.get('window').width;
  const currentUser = useAuthStore(state => state.user);
  const postUserId = post.user?.id;
  const currentUserId = currentUser?.id;
  const isOwnPost = !!currentUserId && currentUserId === postUserId;
  const postId = post.id || '';
  const isFeedActive = useFeedStore(s => s.activePostId === postId);
  const isActive = isActiveProp ?? isFeedActive;
  const isFollowing = !!post.isFollowing;
  const media = post.media || [];
  const hasMultipleMedia = media.length > 1;
  const commentCount = post.commentCount ?? 0;

  const { createFollow, deleteFollow } = useFollowMutation();

  const handleFollowToggle = useCallback(() => {
    if (!postUserId) return;
    if (isFollowing) {
      deleteFollow.mutate(postUserId);
    } else {
      createFollow.mutate(postUserId);
    }
  }, [postUserId, isFollowing, createFollow, deleteFollow]);

  const goToAuthor = useCallback(() => {
    if (!postUserId) return;
    if (isOwnPost) Navigation.goToProfile();
    else Navigation.goToUserProfile(postUserId);
  }, [postUserId, isOwnPost]);

  const openComments = useCallback(() => {
    SheetManager.show('CommentSheet', {
      payload: { targetId: postId, targetType: 'Post' },
    });
  }, [postId]);

  const renderMediaItem = useCallback(
    ({ item, index }: { item: IMedia; index: number }) => {
      return (
        <PostMediaItem
          item={item}
          isPaused={!isActive || index !== activeIndex}
          windowWidth={windowWidth}
        />
      );
    },
    [isActive, activeIndex, windowWidth],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        viewableItems.length > 0 &&
        typeof viewableItems[0].index === 'number'
      ) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const mediaKeyExtractor = useCallback(
    (item: IMedia, index: number) => item?.id || `media-${index}`,
    [],
  );

  return (
    <View style={styles.postContainer}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorRow}>
          <Avatar
            url={post.user?.avatarUrl || post.user?.imageUrl}
            size={34}
            id={postUserId}
            hasActiveStory={false}
          />
          <View style={styles.authorText}>
            <BaseText
              typography={Typography.bodySemiBold.medium}
              numberOfLines={1}
              onPress={goToAuthor}
            >
              {post.user?.username || 'Unknown'}
            </BaseText>
            {!isOwnPost && !isFollowing ? (
              <BaseText
                typography={Typography.bodyRegular.small}
                color={theme.textSecondary}
              >
                Gợi ý cho bạn
              </BaseText>
            ) : null}
          </View>
        </View>

        <View style={styles.headerRightRow}>
          {!isOwnPost && postUserId && (
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing ? themed.followingButton : themed.followButton,
              ]}
              onPress={handleFollowToggle}
              hitSlop={8}
            >
              <BaseText
                typography={Typography.bodySemiBold.small}
                color={isFollowing ? theme.text : theme.white}
              >
                {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </BaseText>
            </TouchableOpacity>
          )}
          <MoreIcon width={22} height={22} onPress={() => {}} />
        </View>
      </View>

      {/* Media */}
      <View style={{ width: windowWidth, aspectRatio: 1 }}>
        <FlatList
          data={media}
          renderItem={renderMediaItem}
          keyExtractor={mediaKeyExtractor}
          pagingEnabled={true}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
        {hasMultipleMedia ? (
          <View style={styles.mediaCounter} pointerEvents="none">
            <BaseText
              typography={Typography.bodySemiBold.small}
              color={theme.white}
            >
              {`${activeIndex + 1}/${media.length}`}
            </BaseText>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.postBody}>
        <View style={styles.actionRow}>
          <View style={styles.actionGroup}>
            <InteractNum
              accessory={
                <LikeButton
                  size={ACTION_ICON_SIZE}
                  id={postId}
                  type="Post"
                  initialLiked={post.isLiked}
                  activeColor={theme.heartRed}
                />
              }
              interactNum={post.likeCount ?? 0}
            />
            <InteractNum
              accessory={
                <CommentIcon
                  width={ACTION_ICON_SIZE}
                  height={ACTION_ICON_SIZE}
                />
              }
              interactNum={commentCount}
              onPress={openComments}
            />
            <InteractNum
              accessory={
                <RepostButton
                  size={ACTION_ICON_SIZE}
                  id={postId}
                  type="Post"
                  initialReposted={post.isReposted}
                />
              }
              interactNum={post.repostCount ?? 0}
            />
            <InteractNum
              accessory={
                <MessageLightIcon
                  width={ACTION_ICON_SIZE}
                  height={ACTION_ICON_SIZE}
                />
              }
              interactNum={post.shareCount ?? 0}
            />
          </View>

          {hasMultipleMedia ? (
            <View style={styles.dots} pointerEvents="none">
              {media.map((m, i) => (
                <View
                  key={m?.id || i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === activeIndex ? theme.blue : theme.separator,
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}

          <BookmarkButton
            size={ACTION_ICON_SIZE}
            id={postId}
            type="Post"
            initialBookmarked={post.isBookmarked}
          />
        </View>

        {/* Caption */}
        {post.caption ? (
          <View style={styles.caption}>
            <BaseText
              numberOfLines={expanded ? undefined : 2}
              onTextLayout={e => {
                if (e.nativeEvent.lines.length > 2) {
                  setCanExpand(true);
                }
              }}
            >
              <BaseText
                typography={Typography.bodySemiBold.medium}
                onPress={goToAuthor}
              >
                {post.user?.username || 'Unknown'}
              </BaseText>
              {'  '}
              <BaseText typography={Typography.bodyRegular.medium}>
                {post.caption}
              </BaseText>
            </BaseText>
            {canExpand ? (
              <TouchableOpacity
                onPress={() => setExpanded(prev => !prev)}
                style={styles.expandButton}
              >
                <BaseText
                  color={theme.textSecondary}
                  typography={Typography.bodyRegular.medium}
                >
                  {expanded ? 'Thu gọn' : 'Xem thêm'}
                </BaseText>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {commentCount > 0 ? (
          <TouchableOpacity onPress={openComments} style={styles.metaRow}>
            <BaseText
              color={theme.textSecondary}
              typography={Typography.bodyRegular.medium}
            >
              {`Xem tất cả ${millify(commentCount)} bình luận`}
            </BaseText>
          </TouchableOpacity>
        ) : null}

        {post.createdAt ? (
          <BaseText
            color={theme.textSecondary}
            typography={Typography.bodyRegular.small}
            style={styles.metaRow}
          >
            {timeAgo(post.createdAt)}
          </BaseText>
        ) : null}
      </View>
    </View>
  );
};

const getThemedStyles = (theme: Theme) =>
  StyleSheet.create({
    followButton: {
      backgroundColor: theme.blue,
    },
    followingButton: {
      backgroundColor: theme.surface,
    },
  });

const styles = StyleSheet.create({
  postContainer: {
    paddingBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  authorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorText: {
    flexShrink: 1,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followButton: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaItem: {
    aspectRatio: 1,
    backgroundColor: '#000',
  },
  mediaCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  postBody: {
    paddingHorizontal: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  caption: {
    marginTop: 2,
  },
  expandButton: {
    marginTop: 2,
  },
  metaRow: {
    marginTop: 6,
  },
});

export default React.memo(Post);
