import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Avatar, BaseText, CustomHeader, SizedBox } from '~/components';
import { ArrowToLeft, NoteIcon } from '~/assets/svgs';
import { Typography } from '~/constants';
import { Theme, useTheme, useConversationMutation } from '~/hooks';
import { Navigation } from '~/utils';
import { conversationApi } from '~/api';
import { AuthenticatedStackParamList } from '~/navigation/types';
import { IConversationMember } from '~/interfaces';
import { InputPopUp } from './InputPopUp';

type RouteProps = RouteProp<
  AuthenticatedStackParamList,
  'ConversationNickname'
>;

const ConversationNickname = () => {
  const route = useRoute<RouteProps>();
  const { id } = route.params || {};

  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const hitSlop8 = { top: 8, bottom: 8, left: 8, right: 8 };

  const { data: conversationData, isLoading } = useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await conversationApi.getConversationById(id);
      return res.data?.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });

  const members: IConversationMember[] = conversationData?.members || [];

  const { updateMemberNickname } = useConversationMutation();
  const [currentMember, setCurrentMember] = useState<IConversationMember>();
  const [isNicknameModalVisible, setIsNicknameModalVisible] = useState(false);

  const handleChangeNickname = async (newNickname: string) => {
    if (!id || !currentMember?.userId) {
      return;
    }
    const trimmed = newNickname.trim();
    await updateMemberNickname.mutateAsync({
      conversationId: id,
      targetUserId: currentMember.userId,
      nickname: trimmed,
    });
    setIsNicknameModalVisible(false);
  };

  const renderMemberItem = useCallback(
    ({ item }: { item: IConversationMember }) => {
      const user = item.user;
      const hasNickname = Boolean(item.nickname?.trim());
      const userName = user?.name || user?.username || 'Thành viên';
      const nicknameText = hasNickname
        ? item.nickname!.trim()
        : 'Đặt biệt danh';

      return (
        <TouchableOpacity
          style={styles.memberItem}
          activeOpacity={0.7}
          onPress={() => {
            setCurrentMember(item);
            setIsNicknameModalVisible(true);
          }}
        >
          <Avatar
            url={user?.avatarUrl || user?.imageUrl}
            size={50}
            onlyAvatar
          />

          <View style={styles.memberInfo}>
            <BaseText
              typography={Typography.bodySemiBold.large}
              color={theme.text}
              numberOfLines={1}
            >
              {userName}
            </BaseText>

            <SizedBox height={2} />

            <BaseText
              typography={Typography.bodyRegular.small}
              color={hasNickname ? theme.placeholder : theme.blue}
              numberOfLines={1}
            >
              {nicknameText}
            </BaseText>
          </View>

          <View style={styles.actionIconBox}>
            <NoteIcon width={20} height={20} color={theme.placeholder} />
          </View>
        </TouchableOpacity>
      );
    },
    [
      styles.actionIconBox,
      styles.memberInfo,
      styles.memberItem,
      theme.blue,
      theme.placeholder,
      theme.text,
    ],
  );

  const renderItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [styles.separator],
  );

  const renderListHeader = useCallback(
    () => (
      <View style={styles.headerInfo}>
        <BaseText
          typography={Typography.bodyRegular.medium}
          color={theme.placeholder}
          style={styles.headerInfoText}
        >
          Mọi người trong cuộc trò chuyện đều có thể nhìn thấy và đặt biệt danh
          cho nhau.
        </BaseText>
      </View>
    ),
    [styles.headerInfo, styles.headerInfoText, theme.placeholder],
  );

  const renderListEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={theme.blue} />
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <BaseText
          typography={Typography.bodyRegular.medium}
          color={theme.placeholder}
        >
          Không tìm thấy thành viên nào
        </BaseText>
      </View>
    );
  }, [isLoading, styles.centerContainer, theme.blue, theme.placeholder]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <CustomHeader
        title="Biệt danh"
        LeftComponent={
          <TouchableOpacity
            onPress={() => Navigation.goBack()}
            hitSlop={hitSlop8}
          >
            <ArrowToLeft width={28} height={28} color={theme.text} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={item => item.id || item.userId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={renderItemSeparator}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
      />

      <InputPopUp
        visible={isNicknameModalVisible}
        onClose={() => setIsNicknameModalVisible(false)}
        title="Chỉnh sửa biệt danh"
        description="Tất cả mọi người đều nhìn thấy biệt danh trong cuộc trò chuyện"
        placeholder="Nhập biệt danh..."
        initialValue={
          currentMember?.nickname || currentMember?.user?.name || ''
        }
        confirmText="Lưu"
        cancelText="Hủy"
        allowEmpty={true}
        isLoading={updateMemberNickname.isPending}
        onConfirm={handleChangeNickname}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContent: {
      paddingBottom: 24,
    },
    headerInfo: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
    },
    headerInfoText: {
      lineHeight: 20,
    },
    memberItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    memberInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'center',
    },
    actionIconBox: {
      paddingLeft: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.divider || theme.grey,
      marginLeft: 78,
    },
    centerContainer: {
      paddingVertical: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default ConversationNickname;
