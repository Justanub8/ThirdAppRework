import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { commonStyles, Typography } from '~/constants'
import { CreateIcon, MenuIcon, AddUserIcon, ReelLightIcon, ArrowToLeft } from '~/assets/svgs'
import { BaseText, FastImage } from '~/components/rn-components'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { images } from '~/assets/images'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { SizedBox } from '~/components/separate-components'
import SlideUpModal from '~/components/slide-up/SlideUpModal'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '~/api/userApi'
import { conversationApi } from '~/api/conversationApi'
import { AuthenticatedStackParamList } from '~/navigation/types'
import { Navigation } from '~/utils'
import { useFollowMutation, useAuthStore } from '~/hooks'
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'

interface AccountProps {
  username: string;
  imageUrl?: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

type RouteProps = RouteProp<AuthenticatedStackParamList, 'UserProfile'>;
 
const UserProfile = () => {
  const route = useRoute<RouteProps>();
  const id = route.params.id;
  const currentUser = useAuthStore(state => state.user);
  const isOwnProfile = currentUser?._id === id;

  const { data, isLoading } = useQuery({
    queryKey: ['userProfile', id],
    queryFn: async () => {
      const res = await userApi.getUser(id);
      return res.data.user;
    }
  });

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (data) {
      setIsFollowing(!!data.isFollowing);
      setFollowerCount(data.follower ?? 0);
    }
  }, [data]);

  const { createFollow, deleteFollow } = useFollowMutation();

  const handleFollowToggle = () => {
    if (!id) return;
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowerCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));

    if (isFollowing) {
      deleteFollow.mutate(id);
    } else {
      createFollow.mutate(id);
    }
  };

  const handleMessage = async () => {
    try {
      const res = await conversationApi.createConversation(id);
      const convId = res.data?.data?._id;
      if (convId) {
        Navigation.goToConversation(convId, data?.username);
      }
    } catch (err) {
      console.error('Failed to create conversation', err);
    }
  };

  const createModalRef = React.useRef<BottomSheetModal>(null);
  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView>
        <View style={commonStyles.paddingScrollHorizontal}>
          <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.justifyBetween]}>
            <ArrowToLeft 
              height={36} width={36}
              onPress={() => Navigation.goBack()}
            />
            <BaseText typography={Typography.bodyBold.xxxLarge}>
              {data?.username}
            </BaseText>
            <MenuIcon height={36} width={36} onPress={() => {console.log(id)}}/>
          </View>
          <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.gap24]}>
            <FastImage 
              source={data?.imageUrl ? { uri: data.imageUrl } : images.avater_random} 
              style ={{height: 90, width: 90, borderWidth: 1 , borderRadius: 9999}}
            />
            <View>
              <BaseText typography= {Typography.bodyBold.medium}>
                {data?.username}
              </BaseText>
              <SizedBox height={8}/>
              <View style = {[commonStyles.flexRow, commonStyles.gap16]}>
                <View>
                  <BaseText typography={Typography.bodyBold.large}>
                  {data?.postCount ?? 0}
                  </BaseText>
                  <BaseText typography={Typography.bodyRegular.medium}>
                  bài viết
                  </BaseText>
                </View>
                <View>
                  <BaseText typography={Typography.bodyBold.large}>
                  {followerCount}
                  </BaseText>
                  <BaseText typography={Typography.bodyRegular.medium}>
                  người theo dõi
                  </BaseText>
                </View>
                <View>
                  <BaseText typography={Typography.bodyBold.large}>
                  {data?.following ?? 0}
                  </BaseText>
                  <BaseText typography={Typography.bodyRegular.medium}>
                  đang theo dõi
                  </BaseText>
                </View>
              </View>
            </View>
          </View>

          <SizedBox height={16}/>

          <View style = {[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.justifyBetween, commonStyles.gap4, ]}>
            {!isOwnProfile && (
              <TouchableOpacity 
                style={[styles.button, isFollowing ? styles.followingButton : styles.followButton, {flex: 1}]}
                onPress={handleFollowToggle}
              >
                <BaseText color={isFollowing ? '#000000' : '#FFFFFF'} typography={Typography.bodyBold.medium}>
                  {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </BaseText>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style = {[styles.button, {flex: 1}]}
              onPress={handleMessage}
            >
              <BaseText color={'#FFFFFF'} typography={Typography.bodyBold.medium}>Nhắn tin</BaseText>
            </TouchableOpacity>
            <TouchableOpacity style = {styles.iconButton}>
              <AddUserIcon height={20} width={20} color={'#FFFFFF'}
                onPress={() => console.log(data)}
              />
            </TouchableOpacity>
          </View>
        </View>
        <SizedBox height={24}/>

        <View style={[commonStyles.testBorder, {height: 500}]}>
          {/* <AccountTopTab/> */}
        </View>
        <SlideUpModal
          ref={createModalRef}
          modalTitle='Tạo'
          renderComponent={
            <View>
              <TouchableOpacity 
                style={[commonStyles.flexRow, commonStyles.testBorder, commonStyles.gap16]} 
                onPress={() => { 
                  createModalRef.current?.close();
                }}
              >
                <ReelLightIcon height={14} width={14}/>
                <BaseText>Thước phim</BaseText>
              </TouchableOpacity>
              <BaseText>Edits</BaseText>
              <BaseText>Tin</BaseText>
              <BaseText>Tin nổi bật</BaseText>
              <BaseText>Video trực tiếp</BaseText>
              <BaseText>AI</BaseText>
            </View>
          }
        />
      </ScrollView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#757575'
  },
  followButton: {
    backgroundColor: '#3797EF',
  },
  followingButton: {
    backgroundColor: '#EFEFEF',
  },
  iconButton: {
    borderRadius: 10,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#757575'
  }
})

export default UserProfile