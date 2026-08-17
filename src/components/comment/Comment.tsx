import { View,  TouchableOpacity, Text, Touchable } from 'react-native'
import { SizedBox } from '../separate-components';
import { commonStyles, Typography } from '~/constants';
import { FastImage, BaseText } from '../rn-components';
import * as React from 'react'
import { images } from '~/assets/images';
import { TextButton } from '../buttons';
import { NotificationIcon, HeartIcon } from '~/assets/svgs';
import { IComment } from '~/interfaces/comment';
import LikeButton from '../buttons/LikeButton';
import { Navigation } from '~/utils';

const Comment = ({ item }: { item: IComment }) => {
  const [likeCount, setLikeCount] = React.useState(item.likeCount);

  React.useEffect(() => {
      setLikeCount(item.likeCount);
  }, [item.likeCount]);

  return (
    <View style={{backgroundColor: "transparent"}}>
        <SizedBox height={8}/>
        <View style={[commonStyles.flexRow, commonStyles.paddingHorizontal16, commonStyles.justifyBetween]}>
        <View style= {[commonStyles.flexRow, commonStyles.gap12, {flex: 1}]}>
            <FastImage source={item.user?.imageUrl ? { uri: item.user.imageUrl } : images.avater_random} style={{height: 40, width: 40, borderRadius: 9999, borderWidth: 1}}/>
            <View style={{flex: 1}}>
                <View>
                    <BaseText typography={Typography.bodyBold.medium} onPress={() => Navigation.goToUserProfile(item.user)}>
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
                <TouchableOpacity style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.gap4, {paddingLeft: 4}]}>
                    {
                        item.replyCount === 0 ? (
                            null
                        ) : (
                            <>
                            <SizedBox height={1} width={32} backgroundColor={'#9e9e9e'}/>
                            <BaseText typography={Typography.bodyRegular.small}>
                                Xem {item.replyCount} câu trả lời khác 
                            </BaseText>
                            </>
                        )
                    }
                </TouchableOpacity>
                </View>
            </View>
        </View>
        <View style={commonStyles.alignItemsCenter}>
            <LikeButton size={24} id={item._id} type="Comment" initialLiked={(item as any).isLiked} onLikeToggle={(isLiked) => setLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1))} inactiveColor="#000000" activeColor="#F44336" />
            <SizedBox height={4}/>
            <BaseText typography ={Typography.bodyRegular.small}>
            {likeCount}
            </BaseText>
        </View>
        </View>
        <SizedBox height={8}/>
    </View>
  )
}

export default Comment