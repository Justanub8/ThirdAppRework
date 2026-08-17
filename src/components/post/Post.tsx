import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { commonStyles, Typography } from '~/constants'
import { BaseText } from '../rn-components'
import { BookmarkBoldIcon, BookmarkLightIcon, CommentIcon, HeartIcon, MessageLightIcon, MoreIcon, NotificationIcon, RepostIcon } from '~/assets/svgs'
import InteractNum from '../interact/InteractNum'
import { LinearGradient } from 'react-native-linear-gradient'
import { FastImage } from '../rn-components'
import { images } from '~/assets/images'
import { SizedBox } from '../separate-components'
import { IPost } from '~/interfaces/post'
import { SheetManager } from 'react-native-actions-sheet'
import { FlashList } from '@shopify/flash-list'
import LikeButton from '../buttons/LikeButton'
import { IMedia } from '~/interfaces'
import Video, { VideoRef } from 'react-native-video'
import { Navigation } from '~/utils'
import { useFollowMutation } from '~/hooks'
const Post = ({ post, isActive = true }: { post: IPost, isActive?: boolean }) => {
    const [expanded, setExpanded] = React.useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [bookmarked, setBookmarked] = React.useState(false);
    const [numberOfLines, setNumberOfLines] = React.useState(0);
    const [likeCount, setLikeCount] = useState(post.likeCount);

    useEffect(() => {
        setLikeCount(post.likeCount);
    }, [post.likeCount]);

    const handleTextLayout = (event: any) => {
        const linesCount = event.nativeEvent.lines.length;
        setNumberOfLines(linesCount);
    };
    const windowWidth = Dimensions.get('window').width;
    const { createFollow, deleteFollow } = useFollowMutation();

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
        )
    })
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
            <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.gap4]}>
                <LinearGradient
                    style = {styles.avatarContainer}
                    colors = {["#FFDC80", "#FCAF45", "#F77737", "#F56040", "#ff022e", "#E1306C", "#e300c8", "#833AB4"]}
                    start={{ x: 0.0, y: 1.0 }}
                    end={{ x: 1.0, y: 0.0 }}
                >
                    <View 
                        style={{ borderRadius: 9999, width:34, height: 34, borderWidth: 1, borderColor: '#ffffff', backgroundColor: '#ffffff'}}
                    >
                        <FastImage
                            source={images.avater_random}
                            resizeMode='cover'
                            style={{width: '100%', height: '100%', borderRadius: 9999}}
                        />
                    </View>
                </LinearGradient>
                <View>
                    <BaseText
                        typography = {Typography.bodyBold.medium}
                        onPress={() => Navigation.goToUserProfile(post.user._id)}
                    >
                        {post.user?.username || 'Unknown'}
                    </BaseText>
                    <BaseText
                        typography = {Typography.bodyRegular.small}
                    >
                        gợi ý cho bạn
                    </BaseText>
                </View>
            </View>

            
            <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.gap8]}>
                {post.isFollowing ? (
                    <TouchableOpacity 
                        style={styles.followButton}
                        onPress={() => deleteFollow.mutate(post.user._id)}
                    >
                        <BaseText>Đang theo dõi</BaseText>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={styles.followButton}
                        onPress={() => createFollow.mutate(post.user._id)}
                    >
                        <BaseText>Theo dõi</BaseText>
                    </TouchableOpacity>
                )}
                <MoreIcon width={24} height={24} onPress={() => { console.log(post)}}/>
            </View>
        </View>
        <View style={{ width: windowWidth, aspectRatio: 1 }}>
            <FlashList
                data={post.media || []}
                renderItem={renderItem}
                keyExtractor={(item, index) => item?._id || index.toString()}
                pagingEnabled={true}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            />
        </View>
        <View style={styles.postBody}>
            <SizedBox height={12}/>
            <View style = {[commonStyles.flexRow, commonStyles.justifyBetween]}>
                <View style = {[commonStyles.flexRow, commonStyles.gap8]}>
                    <InteractNum 
                        accessory={<LikeButton size={24} id={post._id} type="Post" initialLiked={post.isLiked} onLikeToggle={(isLiked) => setLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1))} inactiveColor="#000000" activeColor="#F44336" />} 
                        interactNum={likeCount}
                    />
                    <InteractNum 
                        accessory={<CommentIcon width={24} height={24}/>} 
                        interactNum={post.commentCount}
                        onPress={() => SheetManager.show('CommentSheet', {payload: {targetId: post._id, targetType: "Post"}})}
                    />
                    <InteractNum accessory={<RepostIcon width={24} height={24} />} interactNum={post.repostCount}/>
                    <InteractNum accessory={<MessageLightIcon width={24} height={24}/>} interactNum={post.shareCount}/>
                </View>
                <TouchableOpacity onPress= {() => setBookmarked(prev => !prev)}>
                {
                    bookmarked ? (
                        <BookmarkBoldIcon width={24} height={24} />
                    ) : (
                        <BookmarkLightIcon width={24} height={24} />
                    )
                }
                </TouchableOpacity>
            </View>
            <SizedBox height={12}/>
            <View>
                <BaseText numberOfLines={expanded ? undefined : 1} onTextLayout={handleTextLayout}>
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
                ) : (
                    null
                )}
            </View>
            <SizedBox height={12}/>
        </View>
    </View>
  )
}
const styles = StyleSheet.create({
    postContainer: {
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 64,
        borderWidth: 1,
        borderColor: '#000000'
    },
    postBody: {
        borderWidth: 1,
        borderColor: '#000000',
        paddingHorizontal: 8
    },
    postFooter: {

    },
    button: {
        backgroundColor: '#bdbdbd',
        borderRadius: 8,
        height: 32,
        justifyContent:'center',
        alignItems: 'center',
        paddingHorizontal: 4
    },
    avatarContainer: {
        height: 40,
        width: 40,
        borderRadius: 9999,
        justifyContent: 'center',
        alignItems: 'center'
    },
    followButton: {
        borderRadius: 8,
        backgroundColor: "#a4a4a4",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },  
})

export default Post