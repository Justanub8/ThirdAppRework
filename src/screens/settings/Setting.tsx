import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '~/components/headers';
import { LeftArrow } from '~/assets/svgs';
import { Theme, useAuthStore, useTheme } from '~/hooks';
import { BaseText } from '~/components/rn-components';
import { userApi } from '~/api';
import { Typography } from '~/constants';
import { Navigation } from '~/utils';

const Setting = () => {
  const { theme, mode, setMode } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const currentUser = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);

  const handleToggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const handleToggleActiveStatus = async () => {
    try {
      const nextStatus = currentUser?.showActiveStatus === false ? true : false;
      const res = await userApi.updateProfile({ showActiveStatus: nextStatus });
      if (res.data?.user) {
        updateUser(res.data.user);
      }
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái hoạt động:', err);
    }
  };

  const handleTogglePrivate = async () => {
    try {
      const nextStatus = !currentUser?.isPrivate;
      const res = await userApi.updateProfile({ isPrivate: nextStatus });
      if (res.data?.user) {
        updateUser(res.data.user);
      }
    } catch (err) {
      console.error('Lỗi cập nhật quyền riêng tư:', err);
    }
  };

  const hitSlop8 = { top: 8, bottom: 8, left: 8, right: 8 };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Cài đặt và Hoạt động"
        LeftComponent={
          <TouchableOpacity
            onPress={() => Navigation.goBack()}
            hitSlop={hitSlop8}
          >
            <LeftArrow height={24} width={24} />
          </TouchableOpacity>
        }
      />
      <View style={styles.settingContainer}>
        <TouchableOpacity style={styles.settingRow} onPress={handleToggleTheme}>
          <BaseText color={theme.text} typography={Typography.bodyBold.medium}>
            Chế độ tối
          </BaseText>
          <BaseText
            color={theme.placeholder}
            typography={Typography.bodyRegular.medium}
          >
            {mode === 'dark' ? 'Tối' : 'Sáng'}
          </BaseText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleToggleActiveStatus}
        >
          <BaseText color={theme.text} typography={Typography.bodyBold.medium}>
            Trạng thái hoạt động
          </BaseText>
          <BaseText
            color={theme.placeholder}
            typography={Typography.bodyRegular.medium}
          >
            {currentUser?.showActiveStatus !== false ? 'Bật' : 'Tắt'}
          </BaseText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleTogglePrivate}
        >
          <BaseText color={theme.text} typography={Typography.bodyBold.medium}>
            Tài khoản riêng tư
          </BaseText>
          <BaseText
            color={theme.placeholder}
            typography={Typography.bodyRegular.medium}
          >
            {currentUser?.isPrivate ? 'Bật' : 'Tắt'}
          </BaseText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.background,
      flex: 1,
    },
    settingContainer: {
      flexDirection: 'column',
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
  });

export default Setting;
