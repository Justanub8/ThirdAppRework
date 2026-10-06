import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '~/constants';
import { MenuIcon, AddUserIcon, ReelLightIcon, ArrowToLeft, LockIcon } from '~/assets/svgs';
import { BaseText } from '~/components/rn-components';
import { Avatar } from '~/components/avatar';
import { RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
import { images } from '~/assets/images';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { SizedBox } from '~/components/separate-components';
import SlideUpModal from '~/components/slide-up/SlideUpModal';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '~/api';
import { conversationApi } from '~/api/conversationApi';
import { AuthenticatedStackParamList } from '~/navigation/types';
import { Navigation } from '~/utils';
import { useFollowMutation, useAuthStore, useTheme, Theme } from '~/hooks';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Tabs from '~/screens/profile/components/Tabs';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'UserProfile'>;
 
const UserProfile = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const route = useRoute<RouteProps>();
  const id = route.params?.id;
  const currentUser = useAuthStore(state => state.user);
  const isOwnProfile = currentUser?.id === id;

  const { data: user, isLoading, refetch } = useQuery({
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
  const [isPending, setIsPending] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (user) {
      setIsFollowing(!!user.isFollowing);
      setIsPending(user.followStatus === 'PENDING' || !!user.isPending);
      setFollowerCount(user.follower ?? 0);
    }
  }, [user]);

  const { createFollow, deleteFollow } = useFollowMutation();

  const handleFollowToggle = () => {
    if (!id) return;

    if (isFollowing) {
      setIsFollowing(false);
      setIsPending(false);
      setFollowerCount(prev => Math.max(0, prev - 1));
      deleteFollow.mutate(id);
    } else if (isPending) {
      setIsPending(false);
      setIsFollowing(false);
      deleteFollow.mutate(id);
    } else {
      if (user?.isPrivate) {
        setIsPending(true);
        setIsFollowing(false);
      } else {
        setIsFollowing(true);
        setIsPending(false);
        setFollowerCount(prev => prev + 1);
      }
      createFollow.mutate(id);
    }
  };

  const getFollowButtonConfig = () => {
    if (isFollowing) {
      return {
        text: 'Đang theo dõi',
        style: styles.followingButton,
        textColor: theme.black,
      };
    }
    if (isPending) {
      return {
        text: 'Đã yêu cầu',
        style: styles.followingButton,
        textColor: theme.black,
      };
    }
    return {
      text: 'Theo dõi',
      style: styles.followButton,
      textColor: theme.white,
    };
  };

  const followButtonConfig = getFollowButtonConfig();

  const handleMessage = async () => {
    try {
      const res = await conversationApi.createConversation(id);
      const convId = res.data?.data?.id;
      if (convId) {
        const avatarUri = user?.avatarUrl || user?.imageUrl;
        Navigation.goToConversation(convId, user?.username, avatarUri);
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
            <TouchableOpacity onPress={() => Navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ArrowToLeft height={36} width={36} />
            </TouchableOpacity>
            <BaseText typography={Typography.bodyBold.xxxLarge}>
              {user?.username}
            </BaseText>
            <TouchableOpacity onPress={() => { console.log(id); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MenuIcon height={36} width={36} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfoRow}>
            <Avatar 
              url={user?.avatarUrl || user?.imageUrl} 
              size={86} 
              id={id} 
              hasActiveStory={user?.hasActiveStory}
              isSeenStory={user?.isSeenStory}
            />
            <View>
              <BaseText typography={Typography.bodyBold.medium}>
                {user?.username}
              </BaseText>
              <SizedBox height={8}/>
              <View style={styles.statsRow}>
                <View>
                  <BaseText typography={Typography.bodyBold.large}>
                  {user?.postCount ?? 0}
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
                  {user?.following ?? 0}
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
                style={[styles.button, followButtonConfig.style, styles.flex1]}
                onPress={handleFollowToggle}
              >
                <BaseText color={followButtonConfig.textColor} typography={Typography.bodyBold.medium}>
                  {followButtonConfig.text}
                </BaseText>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.button, styles.flex1]}
              onPress={handleMessage}
            >
              <BaseText color={theme.white} typography={Typography.bodyBold.medium}>Nhắn tin</BaseText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => console.log(user)}
            >
              <AddUserIcon height={20} width={20} color={theme.white} />
            </TouchableOpacity>
          </View>
        </View>
        <SizedBox height={24}/>

        {!isOwnProfile && user?.isPrivate && !isFollowing ? (
          <View style={styles.privateContainer}>
            <View style={styles.lockCircle}>
              <LockIcon height={36} width={36} color={theme.white} />
            </View>
            <SizedBox height={16} />
            <BaseText typography={Typography.bodyBold.large} color={theme.white}>
              Đây là tài khoản riêng tư
            </BaseText>
            <SizedBox height={6} />
            <BaseText typography={Typography.bodyRegular.medium} color={theme.placeholder} style={styles.privateSubtitle}>
              Hãy theo dõi tài khoản này để xem bài viết và thước phim của họ.
            </BaseText>
          </View>
        ) : (
          <View style={styles.tabContainer}>
            <Tabs id={id} />
          </View>
        )}
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
  privateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  lockCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privateSubtitle: {
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.border,
    gap: 16,
  },
});

export default UserProfile;