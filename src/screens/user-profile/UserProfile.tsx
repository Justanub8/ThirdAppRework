import { View, Text, ScrollView, Touchable, StyleSheet ,TouchableOpacity } from 'react-native'
import React from 'react'
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
import { AuthenticatedStackParamList } from '~/navigation/types'
import { Navigation } from '~/utils'

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
    const id = route.params.id
  const { data, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await userApi.getUser(id);
            return res.data.user;
        }
    });
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
            <FastImage source={images.avater_random} style ={{height: 90, width: 90, borderWidth: 1 , borderRadius: 9999}}/>
            <View>
              <BaseText typography= {Typography.bodyBold.medium}>
                {data?.username}
              </BaseText>
              <SizedBox height={8}/>
              <View style = {[commonStyles.flexRow, commonStyles.gap16]}>
                <View>
                  <BaseText typography={Typography.bodyBold.large}>
                  {data?.postCount}
                  </BaseText>
                  <BaseText typography={Typography.bodyRegular.medium}>
                  bài viết
                  </BaseText>
                </View>
                <View>
                  <BaseText typography={Typography.bodyBold.large}>
                  {data?.follower}
                  </BaseText>
                  <BaseText typography={Typography.bodyRegular.medium}>
                  người theo dõi
                  </BaseText>
                </View>
                <View>
                  <BaseText typography={Typography.bodyBold.large}>
                  {data?.following}
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
            <TouchableOpacity style={[styles.button, {flex: 1}]}>
              <BaseText color={'#FFFFFF'} typography={Typography.bodyBold.medium}>Theo dõi</BaseText>
            </TouchableOpacity>
            <TouchableOpacity style = {[styles.button, {flex: 1}]}>
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