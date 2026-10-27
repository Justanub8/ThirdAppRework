import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SheetManager } from 'react-native-actions-sheet';
import {
  Avatar,
  BaseText,
  BaseTextInput,
  CustomHeader,
  SizedBox,
} from '~/components';
import { ArrowToLeft, CameraLightIcon } from '~/assets/svgs';
import { Typography } from '~/constants';
import { useTheme, Theme, useAuthStore } from '~/hooks';
import { Navigation } from '~/utils';
import { userApi, mediaApi } from '~/api';
import { queryClient } from '~/services/queryClient';
import { showToast } from '~/components/globals/GlobalToast';
import { SelectedChatMedia } from '~/components/sheets/MediaSheet';

const EditProfile = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const currentUser = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);

  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [selectedAvatarUri, setSelectedAvatarUri] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const displayAvatarUri =
    selectedAvatarUri || currentUser?.avatarUrl || currentUser?.imageUrl;

  const handleOpenMediaSheet = useCallback(() => {
    SheetManager.show('MediaSheet', {
      payload: {
        mediaType: 'image',
        onSelectMedia: (media: SelectedChatMedia) => {
          if (media?.uri) {
            setSelectedAvatarUri(media.uri);
          }
        },
      },
    });
  }, []);

  const handleSave = async () => {
    const trimmedUsername = username.trim();
    const trimmedName = name.trim();

    if (!trimmedUsername) {
      Alert.alert('Lỗi', 'Tên người dùng không được để trống');
      return;
    }

    try {
      setIsSaving(true);
      let uploadedAvatarUrl: string | undefined;

      if (selectedAvatarUri) {
        const uploadRes = await mediaApi.uploadImage(selectedAvatarUri);
        if (uploadRes?.url) {
          uploadedAvatarUrl = uploadRes.url;
        }
      }

      const payload = {
        name: trimmedName,
        username: trimmedUsername,
        ...(uploadedAvatarUrl && { avatarUrl: uploadedAvatarUrl }),
      };

      const res = await userApi.updateProfile(payload);
      if (res.data?.user) {
        updateUser(res.data.user);
        queryClient.invalidateQueries({ queryKey: ['my-profile'] });
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['suggestedUsers'] });
        showToast({
          text: 'Cập nhật trang cá nhân thành công!',
          type: 'success',
        });
        Navigation.goBack();
      }
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trang cá nhân:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể cập nhật trang cá nhân';
      Alert.alert('Lỗi', errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const hitSlop8 = { top: 8, bottom: 8, left: 8, right: 8 };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <CustomHeader
        title="Chỉnh sửa trang cá nhân"
        LeftComponent={
          <TouchableOpacity
            onPress={() => Navigation.goBack()}
            hitSlop={hitSlop8}
          >
            <ArrowToLeft width={28} height={28} color={theme.text} />
          </TouchableOpacity>
        }
        RightComponent={
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            hitSlop={hitSlop8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.blue} />
            ) : (
              <BaseText
                typography={Typography.bodyBold.large}
                color={theme.blue}
              >
                Lưu
              </BaseText>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <SizedBox height={20} />

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenMediaSheet}
            style={styles.avatarWrapper}
          >
            <Avatar url={displayAvatarUri} size={96} onlyAvatar />
            <View style={styles.cameraBadge}>
              <CameraLightIcon width={16} height={16} color={theme.white} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOpenMediaSheet}
            hitSlop={hitSlop8}
          >
            <BaseText
              color={theme.blue}
              typography={Typography.bodyBold.medium}
            >
              Chỉnh sửa ảnh đại diện
            </BaseText>
          </TouchableOpacity>
        </View>

        <SizedBox height={32} />

        {/* Input Fields */}
        <View style={styles.formContainer}>
          <View style={styles.fieldRow}>
            <View style={styles.labelCol}>
              <BaseText typography={Typography.bodyBold.medium}>Tên</BaseText>
            </View>
            <View style={styles.inputCol}>
              <BaseTextInput
                placeholder="Nhập tên của bạn"
                placeholderTextColor={theme.placeholder}
                typography={Typography.bodyMedium.large}
                value={name}
                onChangeText={setName}
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.labelCol}>
              <BaseText typography={Typography.bodyBold.medium}>
                Tên người dùng
              </BaseText>
            </View>
            <View style={styles.inputCol}>
              <BaseTextInput
                placeholder="Nhập tên người dùng"
                placeholderTextColor={theme.placeholder}
                typography={Typography.bodyMedium.large}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.textInput}
              />
            </View>
          </View>

          {Boolean(currentUser?.email) && (
            <View style={styles.fieldRow}>
              <View style={styles.labelCol}>
                <BaseText typography={Typography.bodyBold.medium}>
                  Email
                </BaseText>
              </View>
              <View style={styles.inputCol}>
                <BaseTextInput
                  value={currentUser?.email}
                  editable={false}
                  typography={Typography.bodyMedium.large}
                  style={styles.disabledInput}
                />
              </View>
            </View>
          )}
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
    scrollContent: {
      paddingBottom: 40,
    },
    avatarSection: {
      alignItems: 'center',
      gap: 12,
    },
    avatarWrapper: {
      position: 'relative',
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.blue,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.background,
    },
    formContainer: {
      paddingHorizontal: 20,
      gap: 20,
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    labelCol: {
      width: 100,
      justifyContent: 'center',
    },
    inputCol: {
      flex: 1,
    },
    textInput: {
      borderBottomColor: theme.border,
      borderBottomWidth: 1,
      paddingBottom: 8,
      paddingHorizontal: 0,
      color: theme.text,
    },
    disabledInput: {
      borderBottomColor: theme.border,
      borderBottomWidth: 1,
      paddingBottom: 8,
      paddingHorizontal: 0,
      color: theme.placeholder,
    },
  });

export default EditProfile;
