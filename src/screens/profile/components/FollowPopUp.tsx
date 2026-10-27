import React, {
  ReactNode,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { followApi } from '~/api';
import { BasePopUp } from '~/components';
import { Avatar } from '~/components/avatar';
import { BaseText } from '~/components/rn-components';
import { Typography } from '~/constants';
import { Theme, useTheme } from '~/hooks';
import { IProfileUser } from '~/interfaces';
import { Navigation } from '~/utils';

export type FollowTabType = 'followers' | 'following';

export interface FollowPopUpProps {
  id?: string;
  initialTab?: FollowTabType;
  visible?: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

export const FollowPopUp: React.FC<FollowPopUpProps> = ({
  id,
  initialTab = 'followers',
  visible: controlledVisible,
  onClose,
  children,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [internalVisible, setInternalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<FollowTabType>(initialTab);

  const isControlled = typeof controlledVisible === 'boolean';
  const isVisible = isControlled ? controlledVisible : internalVisible;

  const handleOpen = () => {
    setActiveTab(initialTab);
    setInternalVisible(true);
  };

  const handleClose = useCallback(() => {
    if (isControlled && onClose) {
      onClose();
    } else {
      setInternalVisible(false);
    }
  }, [isControlled, onClose]);

  useEffect(() => {
    if (isVisible) {
      setActiveTab(initialTab);
    }
  }, [isVisible, initialTab]);

  const { data: followers = [], isLoading: isLoadingFollowers } = useQuery({
    queryKey: ['followers', id],
    queryFn: async () => {
      if (!id) return [];
      const res = await followApi.getFollowers(id);
      return res.data?.data || [];
    },
    enabled: !!id && isVisible,
    staleTime: 30 * 1000,
  });

  const { data: following = [], isLoading: isLoadingFollowing } = useQuery({
    queryKey: ['following', id],
    queryFn: async () => {
      if (!id) return [];
      const res = await followApi.getFollowing(id);
      return res.data?.data || [];
    },
    enabled: !!id && isVisible,
    staleTime: 30 * 1000,
  });

  const currentList = activeTab === 'followers' ? followers : following;
  const isLoading =
    activeTab === 'followers' ? isLoadingFollowers : isLoadingFollowing;

  const handlePressUser = useCallback(
    (user: IProfileUser) => {
      handleClose();
      if (user.id) {
        Navigation.goToUserProfile(user.id);
      }
    },
    [handleClose],
  );

  const renderItem = useCallback(
    ({ item }: { item: IProfileUser }) => {
      return (
        <TouchableOpacity
          style={styles.userRow}
          activeOpacity={0.7}
          onPress={() => handlePressUser(item)}
        >
          <Avatar
            url={item.avatarUrl || item.imageUrl}
            size={42}
            id={item.id}
          />
          <View style={styles.userInfo}>
            <BaseText typography={Typography.bodyBold.medium} numberOfLines={1}>
              {item.username || 'Người dùng'}
            </BaseText>
            {Boolean(item.name) && (
              <BaseText
                typography={Typography.bodyRegular.small}
                color={theme.placeholder}
                numberOfLines={1}
              >
                {item.name}
              </BaseText>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [styles, theme.placeholder, handlePressUser],
  );

  const keyExtractor = useCallback(
    (item: IProfileUser, index: number) => item.id || `user-${index}`,
    [],
  );

  const hitSlop8 = { top: 8, bottom: 8, left: 8, right: 8 };

  return (
    <>
      {children && (
        <TouchableOpacity activeOpacity={0.7} onPress={handleOpen}>
          {children}
        </TouchableOpacity>
      )}

      <BasePopUp
        visible={isVisible}
        onClose={handleClose}
        height={460}
        width={340}
      >
        <View style={styles.container}>
          {/* Header tabs */}
          <View style={styles.header}>
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'followers' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('followers')}
                hitSlop={hitSlop8}
              >
                <BaseText
                  typography={
                    activeTab === 'followers'
                      ? Typography.bodyBold.medium
                      : Typography.bodyRegular.medium
                  }
                  color={
                    activeTab === 'followers' ? theme.text : theme.placeholder
                  }
                >
                  Người theo dõi ({followers.length})
                </BaseText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'following' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('following')}
                hitSlop={hitSlop8}
              >
                <BaseText
                  typography={
                    activeTab === 'following'
                      ? Typography.bodyBold.medium
                      : Typography.bodyRegular.medium
                  }
                  color={
                    activeTab === 'following' ? theme.text : theme.placeholder
                  }
                >
                  Đang theo dõi ({following.length})
                </BaseText>
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.text} />
            </View>
          ) : (
            <FlatList
              data={currentList}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <BaseText
                    typography={Typography.bodyRegular.medium}
                    color={theme.placeholder}
                    style={styles.emptyText}
                  >
                    {activeTab === 'followers'
                      ? 'Chưa có người theo dõi nào'
                      : 'Chưa theo dõi người dùng nào'}
                  </BaseText>
                </View>
              }
            />
          )}
        </View>
      </BasePopUp>
    </>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.sheet || theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tabsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      gap: 16,
      flex: 1,
    },
    tabButton: {
      paddingBottom: 6,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabButtonActive: {
      borderBottomColor: theme.text,
    },
    closeButton: {
      padding: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      flexGrow: 1,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 12,
    },
    userInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyText: {
      textAlign: 'center',
    },
  });

export default FollowPopUp;
