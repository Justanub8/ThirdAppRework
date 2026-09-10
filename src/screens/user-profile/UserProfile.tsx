import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '~/constants';
import { MenuIcon, AddUserIcon, ReelLightIcon, ArrowToLeft } from '~/assets/svgs';
import { BaseText } from '~/components/rn-components';
import { Avatar } from '~/components/avatar';
import { RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
import { images } from '~/assets/images';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { SizedBox } from '~/components/separate-components';
import SlideUpModal from '~/components/slide-up/SlideUpModal';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '~/api/userApi';
import { conversationApi } from '~/api/conversationApi';
import { AuthenticatedStackParamList } from '~/navigation/types';
import { Navigation } from '~/utils';
import { useFollowMutation, useAuthStore, useTheme, Theme } from '~/hooks';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'UserProfile'>;
 
const UserProfile = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const route = useRoute<RouteProps>();
  const id = route.params?.id;
  const currentUser = useAuthStore(state => state.user);
  const isOwnProfile = currentUser?.id === id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['userProfile', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await userApi.getUser(id);
      return res.data.user;
    },
    enabled: !!id,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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
      const convId = res.data?.data?.id || (res.data as any)?.id;
      if (convId) {
        const avatarUri = data?.avatarUrl || data?.imageUrl;
        Navigation.goToConversation(convId, data?.username, avatarUri);
      }
    } catch (err) {
      console.error('Failed to create conversation', err);
    }
  };

  const createModalRef = React.useRef<BottomSheetModal>(null);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.paddingHorizontal}>
          <View style={styles.headerRow}>
            <ArrowToLeft 
              height={36} width={36}
              onPress={() => Navigation.goBack()}
            />
            <BaseText typography={Typography.bodyBold.xxxLarge}>
              {data?.username}
            </BaseText>
            <MenuIcon height={36} width={36} onPress={() => { console.log(id); }}/>
          </View>
          <View style={styles.profileInfoRow}>
            <Avatar 
              url={data?.avatarUrl || data?.imageUrl} 
              size={86} 
              id={id} 
              hasActiveStory={data?.hasActiveStory}
              isSeenStory={data?.isSeenStory}
            />
            <View>
              <BaseText typography={Typography.bodyBold.medium}>
                {data?.username}
              </BaseText>
              <SizedBox height={8}/>
              <View style={styles.statsRow}>
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

          <View style={styles.actionButtonsRow}>
            {!isOwnProfile && (
              <TouchableOpacity 
                style={[styles.button, isFollowing ? styles.followingButton : styles.followButton, styles.flex1]}
                onPress={handleFollowToggle}
              >
                <BaseText color={isFollowing ? theme.black : theme.white} typography={Typography.bodyBold.medium}>
                  {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </BaseText>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.button, styles.flex1]}
              onPress={handleMessage}
            >
              <BaseText color={theme.white} typography={Typography.bodyBold.medium}>Nhắn tin</BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <AddUserIcon height={20} width={20} color={theme.white}
                onPress={() => console.log(data)}
              />
            </TouchableOpacity>
          </View>
        </View>
        <SizedBox height={24}/>

        <View style={styles.tabContainer}>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  paddingHorizontal: {
    paddingHorizontal: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  flex1: {
    flex: 1,
  },
  button: {
    borderRadius: 10,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.grey,
  },
  followButton: {
    backgroundColor: theme.blue,
  },
  followingButton: {
    backgroundColor: theme.buttonLightGrey,
  },
  iconButton: {
    borderRadius: 10,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.grey,
  },
  tabContainer: {
    height: 500,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalOption: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.border,
    gap: 16,
  },
});

export default UserProfile;