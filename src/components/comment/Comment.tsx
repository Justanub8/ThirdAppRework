import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SizedBox } from '../separate-components';
import { Typography } from '~/constants';
import { FastImage, BaseText } from '../rn-components';
import * as React from 'react';
import { images } from '~/assets/images';
import { TextButton } from '../buttons';
import { IComment } from '~/interfaces/comment';
import LikeButton from '../buttons/LikeButton';
import { Navigation } from '~/utils';

const Comment = ({ item }: { item: IComment }) => {
  const [likeCount, setLikeCount] = React.useState(item.likeCount);
  const commentUserId = item.user?.id;
  const commentId = item.id || '';

  React.useEffect(() => {
      setLikeCount(item.likeCount);
  }, [item.likeCount]);

  return (
    <View style={styles.container}>
        <SizedBox height={8}/>
        <View style={styles.commentRow}>
            <View style={styles.contentSection}>
                <TouchableOpacity onPress={() => { if (commentUserId) Navigation.goToUserProfile(commentUserId); }}>
                    <FastImage 
                      source={(item.user?.avatarUrl || item.user?.imageUrl) ? { uri: item.user?.avatarUrl || item.user?.imageUrl } : images.avater_random} 
                      style={styles.avatar}
                    />
                </TouchableOpacity>
                <View style={styles.textContainer}>
                    <View>
                        <BaseText typography={Typography.bodyBold.medium} onPress={() => { if (commentUserId) Navigation.goToUserProfile(commentUserId); }}>
                            {item.user?.username || 'Unknown'}
                        </BaseText>
                        <BaseText typography={Typography.bodyRegular.medium}>
                            {item.content}
                        </BaseText>
                    </View>
                    <View>
                        <SizedBox height={8}/>
                        <TextButton title='Trả lời' typography={Typography.bodyMedium.small}/>
                        <SizedBox height={8}/> 
                        <TouchableOpacity style={styles.repliesButton}>
                            {item.replyCount === 0 ? null : (
                                <>
                                    <SizedBox height={1} width={32} backgroundColor={'#9e9e9e'}/>
                                    <BaseText typography={Typography.bodyRegular.small}>
                                        Xem {item.replyCount} câu trả lời khác 
                                    </BaseText>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={styles.likeColumn}>
                <LikeButton size={24} id={commentId} type="Comment" initialLiked={(item as any).isLiked} onLikeToggle={(isLiked) => setLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1))} activeColor="#F44336" />
                <SizedBox height={4}/>
                <BaseText typography={Typography.bodyRegular.small}>
                    {likeCount}
                </BaseText>
            </View>
        </View>
        <SizedBox height={8}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  contentSection: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 9999,
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
  },
  repliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
  },
  likeColumn: {
    alignItems: 'center',
  },
});

export default Comment;