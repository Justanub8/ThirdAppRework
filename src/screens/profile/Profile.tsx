import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '~/constants';
import { CreateIcon, MenuIcon, AddUserIcon, ReelLightIcon } from '~/assets/svgs';
import { BaseText, FastImage } from '~/components/rn-components';
import { useFocusEffect } from '@react-navigation/native';
import { images } from '~/assets/images';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { SizedBox } from '~/components/separate-components';
import SlideUpModal from '~/components/slide-up/SlideUpModal';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '~/api/userApi';
import { useAuthStore, useTheme, Theme } from '~/hooks';

const Profile = () => {
  const { theme, mode, setMode } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { logoutLocal } = useAuthStore();
  const { data, refetch } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await userApi.getMyProfile();
      return res.data.user;
    }
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const createModalRef = React.useRef<BottomSheetModal>(null);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.paddingHorizontal}>
          <View style={styles.headerRow}>
            <CreateIcon 
              height={36} width={36}
              onPress={() => createModalRef.current?.present()}
            />
            <BaseText typography={Typography.bodyBold.xxxLarge}>
              {data?.username}
            </BaseText>
            <MenuIcon height={36} width={36} onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}/>
          </View>
          <View style={styles.profileInfoRow}>
            <FastImage 
              source={(data?.avatarUrl || data?.imageUrl) ? { uri: data?.avatarUrl || data?.imageUrl } : images.avater_random} 
              style={styles.avatar}
            />
            <View>
              <BaseText typography={Typography.bodyBold.medium}>
                {data?.username}
              </BaseText>
              <SizedBox height={8}/>
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

          <SizedBox height={16}/>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={[styles.button, styles.flex1]}>
              <BaseText color={theme.white} typography={Typography.bodyBold.medium}>Chỉnh sửa</BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.flex1]}>
              <BaseText color={theme.white} typography={Typography.bodyBold.medium}>Chia sẻ trang cá nhân</BaseText>
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
          {/* <AccountTopTab/> */}
        </View>
        <SlideUpModal
          ref={createModalRef}
          modalTitle='Tạo'
          renderComponent={
            <View>
              <TouchableOpacity 
                style={styles.modalOption} 
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
  avatar: {
    height: 90,
    width: 90,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 9999,
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
  button: {
    borderRadius: 10,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.grey,
  },
  iconButton: {
    borderRadius: 10,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.grey,
  },
});

export default Profile;