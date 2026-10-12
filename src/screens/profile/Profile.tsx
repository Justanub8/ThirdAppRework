import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '~/constants';
import { CreateIcon, MenuIcon, AddUserIcon } from '~/assets/svgs';
import { BaseText } from '~/components/rn-components';
import { Avatar } from '~/components/avatar';
import { useFocusEffect } from '@react-navigation/native';
import { SizedBox } from '~/components/separate-components';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '~/api/userApi';
import { useAuthStore, useTheme, Theme } from '~/hooks';
import { SheetManager } from 'react-native-actions-sheet';
import { Navigation } from '~/utils';
import { bookmarkApi, postApi, reelApi } from '~/api';
import Tabs from '~/screens/profile/components/Tabs';
const Profile = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { data, refetch } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await userApi.getMyProfile();
      return res.data.user;
    },
  });

  const currentUser = useAuthStore(state => state.user);
  const currentUserId = currentUser?.id || data?.id;

  const { refetch: refetchPosts } = useQuery({
    queryKey: ['my-post', currentUserId],
    queryFn: async () => {
      const res = await postApi.getAllPosts(1, 30, currentUserId);
      return res?.data?.data || [];
    },
    enabled: !!currentUserId,
  });

  const { refetch: refetchReels } = useQuery({
    queryKey: ['my-reels', currentUserId],
    queryFn: async () => {
      const res = await reelApi.getAllReels(1, 30, currentUserId);
      return res?.data?.data || [];
    },
    enabled: !!currentUserId,
  });

  const { refetch: refetchBookmarks } = useQuery({
    queryKey: ['my-bookmarks'],
    queryFn: async () => {
      const res = await bookmarkApi.getUserBookmarks();
      return res?.data?.data || [];
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
      if (currentUserId) {
        refetchPosts();
        refetchReels();
      }
      refetchBookmarks();
    }, [refetch, refetchPosts, refetchReels, refetchBookmarks, currentUserId]),
  );
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.paddingHorizontal}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => SheetManager.show('CreateSheet')}>
              <CreateIcon height={36} width={36} />
            </TouchableOpacity>
            <BaseText typography={Typography.bodyBold.xxxLarge}>
              {data?.username}
            </BaseText>
            <TouchableOpacity onPress={() => Navigation.goToSetting()}>
              <MenuIcon height={36} width={36} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfoRow}>
            <Avatar
              url={data?.avatarUrl || data?.imageUrl}
              size={86}
              id={data?.id}
              hasActiveStory={data?.hasActiveStory}
              isSeenStory={data?.isSeenStory}
            />
            <View>
              <BaseText typography={Typography.bodyBold.medium}>
                {data?.username}
              </BaseText>
              <SizedBox height={8} />
              <View style={styles.statsRow}>
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

          <SizedBox height={16} />

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.flexButton}>
              <BaseText
                color={theme.white}
                typography={Typography.bodyBold.medium}
              >
                Chỉnh sửa
              </BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.flexButton}>
              <BaseText
                color={theme.white}
                typography={Typography.bodyBold.medium}
              >
                Chia sẻ trang cá nhân
              </BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <AddUserIcon
                height={20}
                width={20}
                color={theme.white}
                onPress={() => console.log(data)}
              />
            </TouchableOpacity>
          </View>
        </View>
        <SizedBox height={24} />

        <View style={styles.tabContainer}>
          <Tabs id={currentUserId} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
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
    flexButton: {
      flex: 1,
      borderRadius: 8,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.grey,
    },
    tabContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalOption: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme.border,
      gap: 16,
    },
    iconButton: {
      borderRadius: 8,
      height: 36,
      width: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.grey,
    },
  });

export default Profile;
