import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Typography } from '~/constants';
import { BaseText } from '../rn-components';
import { CommentIcon, MoreIcon, MessageLightIcon } from '~/assets/svgs';
import InteractNum from '../interact/InteractNum';
import { LinearGradient } from 'react-native-linear-gradient';
import { FastImage } from '../rn-components';
import { images } from '~/assets/images';
import { SizedBox } from '../separate-components';
import { IPost } from '~/interfaces/post';
import { SheetManager } from 'react-native-actions-sheet';
import { FlashList } from '@shopify/flash-list';
import LikeButton from '../buttons/LikeButton';
import BookmarkButton from '../buttons/BookmarkButton';
import { IMedia } from '~/interfaces';
import Video from 'react-native-video';
import { Navigation } from '~/utils';
import { useFollowMutation, useAuthStore } from '~/hooks';
import { RepostButton } from '../buttons';

const Post = ({ post, isActive = true }: { post: IPost, isActive?: boolean }) => {
    const [expanded, setExpanded] = React.useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [numberOfLines, setNumberOfLines] = React.useState(0);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [repostCount, setRepostCount] = useState(post.repostCount);
    const [isFollowing, setIsFollowing] = useState(!!post.isFollowing);
    const windowWidth = Dimensions.get('window').width;
    const currentUser = useAuthStore(state => state.user);
    const postUserId = post.user?.id || post.user?._id;
    const currentUserId = currentUser?.id || currentUser?._id;
    const isOwnPost = !!currentUserId && currentUserId === postUserId;
    const postId = post.id || post._id || '';

    useEffect(() => {
        setLikeCount(post.likeCount);
    }, [post.likeCount]);

    useEffect(() => {
        setRepostCount(post.repostCount);
    }, [post.repostCount]);

    useEffect(() => {
        setIsFollowing(!!post.isFollowing);
    }, [postUserId, post.isFollowing]);

    const { createFollow, deleteFollow } = useFollowMutation();

    const handleFollowToggle = () => {
        if (!postUserId) return;
        const nextState = !isFollowing;
        setIsFollowing(nextState);
        if (isFollowing) {
            deleteFollow.mutate(postUserId);
        } else {
            createFollow.mutate(postUserId);
        }
    };

    const renderItem = (({ item, index}: {item: IMedia, index: number}) => {
        return (
            <View style={{ width: windowWidth, aspectRatio: 1, backgroundColor: '#000' }}>
                {item.type === 'video' ? (
                    <Video
                        source={{uri: item?.url}}
                        style={StyleSheet.absoluteFill}
                        resizeMode='contain'
                        repeat={true}
                        paused={!isActive || index !== activeIndex}
                    />
                ) : (
                    <FastImage
                        source={{uri: item?.url}}
                        style={StyleSheet.absoluteFill}
                        resizeMode='contain'
                    />
                )}
            </View>
        );
    });

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
          setActiveIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

  return (
    <View style={styles.postContainer}>
        <View style={styles.postHeader}>
            <View style={styles.authorRow}>
                <LinearGradient
                    style={styles.avatarContainer}
                    colors={["#FFDC80", "#FCAF45", "#F77737", "#F56040", "#ff022e", "#E1306C", "#e300c8", "#833AB4"]}
                    start={{ x: 0.0, y: 1.0 }}
                    end={{ x: 1.0, y: 0.0 }}
                >
                    <View style={styles.avatarInner}>
                        <FastImage
                            source={(post.user?.avatarUrl || post.user?.imageUrl) ? { uri: post.user?.avatarUrl || post.user?.imageUrl } : images.avater_random}
                            resizeMode='cover'
                            style={styles.avatarImage}
                        />
                    </View>
                </LinearGradient>
                <View>
                    <BaseText
                        typography={Typography.bodyBold.medium}
                        onPress={() => { if (postUserId) Navigation.goToUserProfile(postUserId); }}
                    >
                        {post.user?.username || 'Unknown'}
                    </BaseText>
                    <BaseText typography={Typography.bodyRegular.small}>
                        gợi ý cho bạn
                    </BaseText>
                </View>
            </View>

            <View style={styles.headerRightRow}>
                {!isOwnPost && postUserId && (
                    <TouchableOpacity 
                        style={[styles.followButton, isFollowing && styles.followingButton]}
                        onPress={handleFollowToggle}
                    >
                        <BaseText 
                            typography={Typography.bodySemiBold.small} 
                            color={isFollowing ? '#000000' : '#FFFFFF'}
                        >
                            {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                        </BaseText>
                    </TouchableOpacity>
                )}
                <MoreIcon width={24} height={24} onPress={() => { console.log(post); }}/>
            </View>
        </View>
        <View style={{ width: windowWidth, aspectRatio: 1 }}>
            <FlashList
                data={post.media || []}
                renderItem={renderItem}
                keyExtractor={(item, index) => item?.id || item?._id || index.toString()}
                pagingEnabled={true}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            />
        </View>
        <View style={styles.postBody}>
            <SizedBox height={12}/>
            <View style={styles.actionRow}>
                <View style={styles.actionGroup}>
                    <InteractNum 
                        accessory={<LikeButton size={24} id={postId} type="Post" initialLiked={post.isLiked} onLikeToggle={(isLiked) => setLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1))} inactiveColor="#000000" activeColor="#F44336" />} 
                        interactNum={likeCount}
                    />
                    <InteractNum 
                        accessory={<CommentIcon width={24} height={24}/>} 
                        interactNum={post.commentCount}
                        onPress={() => SheetManager.show('CommentSheet', {payload: {targetId: postId, targetType: "Post"}})}
                    />
                    <InteractNum accessory={<RepostButton size={24} id={postId} type="Post" initialReposted={post.isReposted} onRepostToggle={(isReposted) => setRepostCount(prev => isReposted ? prev + 1 : Math.max(0, prev - 1))}/>} interactNum={repostCount}/>
                    <InteractNum accessory={<MessageLightIcon width={24} height={24}/>} interactNum={post.shareCount}/>
                </View>
                <BookmarkButton 
                    size={24} 
                    id={postId} 
                    type="Post" 
                    initialBookmarked={post.isBookmarked} 
                />
            </View>
            <SizedBox height={12}/>
            <View>
                <BaseText numberOfLines={expanded ? undefined : 1}>
                    <BaseText typography={Typography.bodyBold.medium} onPress={() => {}}>
                        {post.user?.username || 'Unknown'}
                    </BaseText>
                    <SizedBox width={8}/>
                    <BaseText typography={Typography.bodyRegular.medium}>
                        {post.caption}
                    </BaseText>
                </BaseText>
                {numberOfLines > 1 ? (
                    <TouchableOpacity onPress={() => setExpanded(prev => !prev)} style={{ marginTop: 4 }}>
                        <BaseText color={'#9e9e9e'} typography={Typography.bodyRegular.medium}>
                            {expanded ? 'See less' : 'See more'}
                        </BaseText>
                    </TouchableOpacity>
                ) : null}
            </View>
            <SizedBox height={12}/>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    postContainer: {},
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 64,
        alignItems: 'center',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarContainer: {
        height: 40,
        width: 40,
        borderRadius: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInner: {
        borderRadius: 9999,
        width: 34,
        height: 34,
        borderWidth: 1,
        borderColor: '#ffffff',
        backgroundColor: '#ffffff',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 9999,
    },
    headerRightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    postBody: {
        paddingHorizontal: 8,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionGroup: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    followButton: {
        borderRadius: 8,
        backgroundColor: "#3797EF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },  
    followingButton: {
        backgroundColor: "#EFEFEF",
    },
});

export default React.memo(Post);