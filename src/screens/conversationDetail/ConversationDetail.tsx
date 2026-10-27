import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Avatar, BaseText, CustomHeader, SizedBox } from '~/components';
import {
  ArrowToLeft,
  NotificationIcon,
  TextAaIcon,
  SearchLightIcon,
  FolderLightIcon,
  NoteIcon,
  AddUserIcon,
  MoreIcon,
  LockIcon,
  InfoCircleBoldIcon,
  LogoutBoldIcon,
  CrossIcon,
  RightArrow,
  CameraLightIcon,
  HeartIcon,
} from '~/assets/svgs';
import { Typography } from '~/constants';
import {
  useTheme,
  Theme,
  useConversationMutation,
  useAuthStore,
} from '~/hooks';
import { Navigation } from '~/utils';
import { conversationApi } from '~/api/conversationApi';
import { AuthenticatedStackParamList } from '~/navigation/types';
import { IConversationMember } from '~/interfaces';
import { InputPopUp } from './components/InputPopUp';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'ConversationDetail'>;

const ConversationDetail = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const route = useRoute<RouteProps>();

  const { id, name: routeName, imageUrl: routeImageUrl } = route.params || {};
  const currentUserId = useAuthStore(state => state.user?.id);

  const { data: conversationData } = useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await conversationApi.getConversationById(id);
      return res.data?.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });

  const isGroup = Boolean(conversationData?.isGroup);
  const members: IConversationMember[] = conversationData?.members || [];
  const otherMember =
    members.find(m => m.userId !== currentUserId) || members[0];
  const displayName =
    conversationData?.name ||
    conversationData?.nickname ||
    otherMember?.nickname ||
    otherMember?.user?.name ||
    otherMember?.user?.username ||
    routeName;
  const displayAvatar = conversationData?.avatarUrl || routeImageUrl;

  const { updateGroup } = useConversationMutation();
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);

  const handleChangeGroupName = async (newName: string) => {
    if (!id) {
      return;
    }
    const trimmed = newName.trim();
    if (!trimmed) {
      return;
    }
    await updateGroup.mutateAsync({
      id,
      data: { name: trimmed },
    });
  };

  const handleOpenTheme = () => {
    // TODO: Mở bảng chọn chủ đề màu sắc / biểu tượng cảm xúc
    Alert.alert(
      'Chủ đề & Emoji',
      'Chọn màu chủ đề và biểu tượng cảm xúc nhanh.',
    );
  };

  const handleSearchConversation = () => {
    // TODO: Mở thanh tìm kiếm tin nhắn trong đoạn chat
    Alert.alert('Tìm kiếm', 'Tìm kiếm tin nhắn trong cuộc trò chuyện.');
  };

  const handleViewPinnedMessages = () => {
    if (id) {
      Navigation.goToConversationPinned(id);
    }
  };

  const handleAddMembers = () => {
    // TODO: Mở màn hình/sheet chọn thêm thành viên vào nhóm
    Alert.alert(
      'Thêm thành viên',
      'Mở danh sách bạn bè để thêm vào nhóm chat.',
    );
  };

  const handleMemberAction = (member: IConversationMember) => {
    // TODO: Mở ActionSheet/Popup phân quyền hoặc xoá thành viên
    Alert.alert(
      `Tùy chọn: ${member.user?.name || member.user?.username || 'Thành viên'}`,
      `Vai trò hiện tại: ${
        member.role === 'OWNER'
          ? 'Trưởng nhóm'
          : member.role === 'ADMIN'
          ? 'Quản trị viên'
          : 'Thành viên'
      }`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xem trang cá nhân',
          onPress: () =>
            member.userId && Navigation.goToUserProfile(member.userId),
        },
        { text: 'Chỉnh vai trò (Role)', onPress: () => {} },
        { text: 'Đặt biệt danh', onPress: () => {} },
        { text: 'Xóa khỏi nhóm', style: 'destructive', onPress: () => {} },
      ],
    );
  };

  const handleViewMedia = () => {
    // TODO: Xem kho ảnh, video và file đã gửi
    Alert.alert('File phương tiện', 'Xem tất cả ảnh, video và tệp đã chia sẻ.');
  };

  const handleLeaveConversation = () => {
    // TODO: Rời nhóm trò chuyện
    Alert.alert(
      'Rời khỏi cuộc trò chuyện',
      'Bạn có chắc chắn muốn rời khỏi nhóm này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Rời nhóm',
          style: 'destructive',
          onPress: () => Navigation.goBack(),
        },
      ],
    );
  };

  const handleDeleteConversation = () => {
    // TODO: Xóa đoạn chat
    Alert.alert(
      'Xóa cuộc trò chuyện',
      'Toàn bộ lịch sử tin nhắn sẽ bị xóa và không thể khôi phục.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => Navigation.goBack(),
        },
      ],
    );
  };

  const hitSlop8 = { top: 8, bottom: 8, left: 8, right: 8 };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <CustomHeader
        title="Chi tiết đoạn chat"
        LeftComponent={
          <TouchableOpacity
            onPress={() => Navigation.goBack()}
            hitSlop={hitSlop8}
          >
            <ArrowToLeft width={28} height={28} color={theme.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SizedBox height={16} />

        <View style={styles.topProfileSection}>
          <View style={styles.avatarContainer}>
            <Avatar url={displayAvatar} size={96} onlyAvatar />
          </View>

          <SizedBox height={12} />
          {isGroup ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsRenameModalVisible(true)}
            >
              <BaseText
                typography={Typography.bodyBold.xLarge}
                numberOfLines={1}
              >
                {displayName}
              </BaseText>
            </TouchableOpacity>
          ) : (
            <BaseText typography={Typography.bodyBold.xLarge} numberOfLines={1}>
              {displayName}
            </BaseText>
          )}

          <SizedBox height={4} />

          <BaseText
            typography={Typography.bodyRegular.medium}
            color={theme.placeholder}
          >
            {isGroup ? `${members.length} thành viên` : 'Đang hoạt động'}
          </BaseText>
        </View>

        <SizedBox height={24} />

        {/* 3. Tùy chỉnh đoạn chat (Customization Card) */}
        <View style={styles.cardGroup}>
          <BaseText
            typography={Typography.bodyBold.medium}
            color={theme.placeholder}
            style={styles.sectionTitle}
          >
            TÙY CHỈNH ĐOẠN CHAT
          </BaseText>

          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={styles.cardRow}
              activeOpacity={0.6}
              onPress={handleOpenTheme}
            >
              <View style={styles.rowLeft}>
                <View style={styles.itemIconBox}>
                  <HeartIcon width={20} height={20} color={theme.text} />
                </View>
                <BaseText typography={Typography.bodyMedium.medium}>
                  Chủ đề & Biểu tượng cảm xúc
                </BaseText>
              </View>
              <RightArrow width={18} height={18} color={theme.placeholder} />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            <TouchableOpacity
              style={styles.cardRow}
              activeOpacity={0.6}
              onPress={() => Navigation.goToConversationNickname(id)}
            >
              <View style={styles.rowLeft}>
                <View style={styles.itemIconBox}>
                  <TextAaIcon width={20} height={20} color={theme.text} />
                </View>
                <BaseText typography={Typography.bodyMedium.medium}>
                  Biệt danh
                </BaseText>
              </View>
              <RightArrow width={18} height={18} color={theme.placeholder} />
            </TouchableOpacity>

            <View style={styles.cardDivider} />
            {isGroup && (
              <TouchableOpacity
                style={styles.cardRow}
                activeOpacity={0.6}
                onPress={() => setIsRenameModalVisible(true)}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.itemIconBox}>
                    <CameraLightIcon
                      width={20}
                      height={20}
                      color={theme.text}
                    />
                  </View>
                  <BaseText typography={Typography.bodyMedium.medium}>
                    Đổi tên hoặc ảnh bìa nhóm
                  </BaseText>
                </View>
                <RightArrow width={18} height={18} color={theme.placeholder} />
              </TouchableOpacity>
            )}
            <View style={styles.cardDivider} />

            <TouchableOpacity
              style={styles.cardRow}
              activeOpacity={0.6}
              onPress={handleSearchConversation}
            >
              <View style={styles.rowLeft}>
                <View style={styles.itemIconBox}>
                  <SearchLightIcon width={20} height={20} color={theme.text} />
                </View>
                <BaseText typography={Typography.bodyMedium.medium}>
                  Tìm kiếm trong cuộc trò chuyện
                </BaseText>
              </View>
              <RightArrow width={18} height={18} color={theme.placeholder} />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            <TouchableOpacity
              style={styles.cardRow}
              activeOpacity={0.6}
              onPress={handleViewPinnedMessages}
            >
              <View style={styles.rowLeft}>
                <View style={styles.itemIconBox}>
                  <NoteIcon width={20} height={20} color={theme.text} />
                </View>
                <BaseText typography={Typography.bodyMedium.medium}>
                  Tin nhắn đã ghim
                </BaseText>
              </View>
              <RightArrow width={18} height={18} color={theme.placeholder} />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            <View style={styles.cardRow}>
              <View style={styles.rowLeft}>
                <View style={styles.itemIconBox}>
                  <NotificationIcon width={20} height={20} color={theme.text} />
                </View>
                <BaseText typography={Typography.bodyMedium.medium}>
                  Tắt thông báo tin nhắn
                </BaseText>
              </View>
              <Switch trackColor={{ false: theme.border, true: theme.blue }} />
            </View>
          </View>
        </View>

        <SizedBox height={24} />

        {/* 4. Thành viên trong đoạn chat (Members List) */}
        {isGroup && (
          <View style={styles.cardGroup}>
            <View style={styles.membersHeaderRow}>
              <BaseText
                typography={Typography.bodyBold.medium}
                color={theme.placeholder}
                style={styles.sectionTitle}
              >
                THÀNH VIÊN ({members.length})
              </BaseText>
              <TouchableOpacity
                style={styles.addMemberBtn}
                activeOpacity={0.7}
                onPress={handleAddMembers}
                hitSlop={hitSlop8}
              >
                <AddUserIcon width={16} height={16} color={theme.blue} />
                <BaseText
                  color={theme.blue}
                  typography={Typography.bodyBold.small}
                >
                  Thêm người
                </BaseText>
              </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
              {members.map((member, index) => {
                const user = member.user;
                const isOwner = member.role === 'OWNER';
                const isAdmin = member.role === 'ADMIN';

                return (
                  <React.Fragment key={member.id || member.userId || index}>
                    <TouchableOpacity
                      style={styles.memberRow}
                      activeOpacity={0.7}
                      onPress={() => handleMemberAction(member)}
                    >
                      <Avatar
                        url={user?.avatarUrl || user?.imageUrl}
                        size={44}
                        onlyAvatar
                      />
                      <View style={styles.memberInfo}>
                        <BaseText
                          typography={Typography.bodyBold.medium}
                          numberOfLines={1}
                        >
                          {member.nickname ||
                            user?.name ||
                            user?.username ||
                            'Thành viên'}
                        </BaseText>
                        {Boolean(user?.username) && (
                          <BaseText
                            typography={Typography.bodyRegular.small}
                            color={theme.placeholder}
                            numberOfLines={1}
                          >
                            @{user?.username}
                          </BaseText>
                        )}
                      </View>

                      {/* Role Badge */}
                      <View style={styles.memberRight}>
                        {isOwner ? (
                          <View
                            style={[
                              styles.roleBadge,
                              { backgroundColor: theme.blue },
                            ]}
                          >
                            <BaseText
                              typography={Typography.bodyRegular.xSmall}
                              color={theme.white}
                            >
                              Trưởng nhóm
                            </BaseText>
                          </View>
                        ) : isAdmin ? (
                          <View
                            style={[
                              styles.roleBadge,
                              { backgroundColor: theme.grey },
                            ]}
                          >
                            <BaseText
                              typography={Typography.bodyRegular.xSmall}
                              color={theme.text}
                            >
                              Quản trị viên
                            </BaseText>
                          </View>
                        ) : null}

                        <TouchableOpacity
                          onPress={() => handleMemberAction(member)}
                          hitSlop={hitSlop8}
                          style={styles.moreIconBtn}
                        >
                          <MoreIcon
                            width={18}
                            height={18}
                            color={theme.placeholder}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>

                    {index < members.length - 1 && (
                      <View style={styles.cardDivider} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        )}

        <SizedBox height={24} />
        <View style={styles.cardGroup}>
          <BaseText
            typography={Typography.bodyBold.medium}
            color={theme.placeholder}
            style={styles.sectionTitle}
          >
            FILE & BỘ NHỚ
          </BaseText>

          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={styles.cardRow}
              activeOpacity={0.6}
              onPress={handleViewMedia}
            >
              <View style={styles.rowLeft}>
                <View style={styles.itemIconBox}>
                  <FolderLightIcon width={20} height={20} color={theme.text} />
                </View>
                <BaseText typography={Typography.bodyMedium.medium}>
                  File phương tiện, file và liên kết
                </BaseText>
              </View>
              <RightArrow width={18} height={18} color={theme.placeholder} />
            </TouchableOpacity>
          </View>
        </View>

        <SizedBox height={24} />

        {/* 6. Quyền riêng tư & Hành động nguy hiểm */}
        <View style={styles.cardGroup}>
          <BaseText
            typography={Typography.bodyBold.medium}
            color={theme.placeholder}
            style={styles.sectionTitle}
          >
            QUYỀN RIÊNG TƯ & HỖ TRỢ
          </BaseText>

          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.cardRow} activeOpacity={0.6}>
              <View style={styles.rowLeft}>
                <View style={styles.itemIconBox}>
                  <LockIcon width={20} height={20} color={theme.text} />
                </View>
                <BaseText typography={Typography.bodyMedium.medium}>
                  Mã hóa đầu cuối
                </BaseText>
              </View>
              <RightArrow width={18} height={18} color={theme.placeholder} />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            <TouchableOpacity style={styles.cardRow} activeOpacity={0.6}>
              <View style={styles.rowLeft}>
                <View style={styles.itemIconBox}>
                  <InfoCircleBoldIcon
                    width={20}
                    height={20}
                    color={theme.text}
                  />
                </View>
                <BaseText typography={Typography.bodyMedium.medium}>
                  Báo cáo sự cố
                </BaseText>
              </View>
              <RightArrow width={18} height={18} color={theme.placeholder} />
            </TouchableOpacity>

            {isGroup && (
              <>
                <View style={styles.cardDivider} />
                <TouchableOpacity
                  style={styles.cardRow}
                  activeOpacity={0.6}
                  onPress={handleLeaveConversation}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.itemIconBox}>
                      <LogoutBoldIcon
                        width={20}
                        height={20}
                        color={theme.red}
                      />
                    </View>
                    <BaseText
                      typography={Typography.bodyMedium.medium}
                      color={theme.red}
                    >
                      Rời khỏi cuộc trò chuyện
                    </BaseText>
                  </View>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.cardDivider} />

            <TouchableOpacity
              style={styles.cardRow}
              activeOpacity={0.6}
              onPress={handleDeleteConversation}
            >
              <View style={styles.rowLeft}>
                <View style={styles.itemIconBox}>
                  <CrossIcon width={20} height={20} color={theme.red} />
                </View>
                <BaseText
                  typography={Typography.bodyMedium.medium}
                  color={theme.red}
                >
                  Xóa cuộc trò chuyện
                </BaseText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <SizedBox height={40} />
      </ScrollView>

      {isGroup && (
        <InputPopUp
          visible={isRenameModalVisible}
          onClose={() => setIsRenameModalVisible(false)}
          title="Đổi tên nhóm"
          description="Nhập tên mới cho nhóm trò chuyện"
          placeholder="Nhập tên nhóm..."
          initialValue={displayName}
          confirmText="Lưu"
          cancelText="Hủy"
          isLoading={updateGroup.isPending}
          onConfirm={handleChangeGroupName}
        />
      )}
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
    topProfileSection: {
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    avatarContainer: {
      position: 'relative',
    },
    cameraIconBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      backgroundColor: theme.blue,
      borderRadius: 14,
      width: 28,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.background,
    },
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
      paddingHorizontal: 16,
    },
    actionBtnItem: {
      alignItems: 'center',
      minWidth: 70,
    },
    actionIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.sheet || theme.grey,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    actionLabel: {
      textAlign: 'center',
    },
    cardGroup: {
      paddingHorizontal: 16,
    },
    sectionTitle: {
      marginBottom: 8,
      marginLeft: 4,
    },
    membersHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    addMemberBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    cardContainer: {
      backgroundColor: theme.sheet || '#1E1E1E',
      borderRadius: 14,
      overflow: 'hidden',
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    cardDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.border,
      marginLeft: 52,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    itemIconBox: {
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 12,
    },
    memberInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    memberRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    moreIconBtn: {
      padding: 4,
    },
  });

export default ConversationDetail;
