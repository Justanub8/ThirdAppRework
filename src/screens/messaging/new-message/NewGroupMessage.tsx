import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import { Theme, useTheme, useConversationMutation } from '~/hooks';
import { IProfileUser } from '~/interfaces';
import { CustomHeader } from '~/components/headers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LeftArrow, CheckCircleIcon, CrossIcon } from '~/assets/svgs';
import { Navigation } from '~/utils';
import { BaseText, BaseTextInput } from '~/components/rn-components';
import { Typography } from '~/constants';
import Avatar from '~/components/avatar';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '~/api';

const NewGroupMessage = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentContact, setCurrentContact] = useState<IProfileUser[]>([]);
  const [customGroupName, setCustomGroupName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { createGroupConversation } = useConversationMutation();

  const { data: usersData } = useQuery({
    queryKey: ['suggestedUsers'],
    queryFn: async () => {
      const res = await userApi.getAllUsers(1, 20);
      return res.data?.users || res.data?.data || [];
    },
  });

  const defaultGroupName = useMemo(() => {
    return currentContact
      .map(c => c.name || c.username)
      .filter(Boolean)
      .join(', ');
  }, [currentContact]);

  const users = useMemo(() => {
    const list: IProfileUser[] = usersData || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      u =>
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q)),
    );
  }, [usersData, searchQuery]);

  const handleToggleContact = (user: IProfileUser) => {
    setCurrentContact(prev => {
      const exists = prev.some(c => c.id === user.id);
      if (exists) {
        return prev.filter(c => c.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const handleRemoveContact = (userId: string) => {
    setCurrentContact(prev => prev.filter(c => c.id !== userId));
  };

  const canCreate = currentContact.length >= 2 && !isSending;

  const handleCreateGroupChat = async () => {
    if (!canCreate) return;
    setIsSending(true);
    try {
      const participantIds = currentContact
        .map(c => c.id)
        .filter((id): id is string => Boolean(id));

      const res = await createGroupConversation.mutateAsync(participantIds);
      const createdConv = res.data?.data;
      if (createdConv?.id) {
        const finalName =
          customGroupName.trim() || defaultGroupName || 'Nhóm chat';
        Navigation.goToConversation(createdConv.id, finalName);
      }
    } catch (error) {
      console.log('Lỗi khi tạo nhóm chat:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <CustomHeader
        title="Nhóm mới"
        LeftComponent={
          <LeftArrow height={24} width={24} onPress={() => Navigation.pop()} />
        }
        RightComponent={
          <TouchableOpacity
            onPress={handleCreateGroupChat}
            disabled={!canCreate}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={theme.primaryBlue} />
            ) : (
              <BaseText
                typography={Typography.bodyBold.large}
                color={canCreate ? theme.primaryBlue : theme.buttonDisabled}
              >
                Tạo
              </BaseText>
            )}
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.groupNameContainer}>
          <BaseText
            typography={Typography.bodyMedium.medium}
            color={theme.subtext}
          >
            Tên nhóm:
          </BaseText>
          <BaseTextInput
            style={styles.groupNameInput}
            placeholder={defaultGroupName || 'Đặt tên nhóm (tuỳ chọn)'}
            placeholderTextColor={theme.subtext}
            value={customGroupName}
            onChangeText={setCustomGroupName}
            typography={Typography.bodyMedium.large}
          />
        </View>

        <View style={styles.inputContainer}>
          <BaseText typography={Typography.bodyMedium.large}>Đến:</BaseText>
          <BaseTextInput
            style={styles.toWhomInput}
            placeholder="Tìm kiếm người dùng..."
            placeholderTextColor={theme.subtext}
            typography={Typography.bodyMedium.large}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {currentContact.length > 0 && (
          <View style={styles.selectedSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedList}
              keyboardShouldPersistTaps="handled"
            >
              {currentContact.map(contact => (
                <View key={contact.id} style={styles.chip}>
                  <Avatar
                    url={contact.avatarUrl || contact.imageUrl}
                    size={24}
                    disabled
                  />
                  <BaseText
                    typography={Typography.bodyRegular.small}
                    numberOfLines={1}
                    style={styles.chipText}
                  >
                    {contact.username || contact.name}
                  </BaseText>
                  <TouchableOpacity
                    onPress={() =>
                      contact.id && handleRemoveContact(contact.id)
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <CrossIcon width={12} height={12} color={theme.subtext} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.suggestionListContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.suggestionHeader}>
            <BaseText typography={Typography.bodyBold.large}>Gợi ý</BaseText>
          </View>

          <View style={styles.suggestionItems}>
            {users.map(item => {
              const itemAvatar = item.avatarUrl || item.imageUrl;
              const itemKey = item.id;
              const isSelected =
                !!itemKey && currentContact.some(c => c.id === itemKey);

              return (
                <TouchableOpacity
                  key={itemKey}
                  style={styles.contactContainer}
                  onPress={() => handleToggleContact(item)}
                >
                  <Avatar url={itemAvatar} size={48} disabled />
                  <View style={styles.contactInfo}>
                    <BaseText typography={Typography.bodySemiBold.medium}>
                      {item.username}
                    </BaseText>
                    {item.name && (
                      <BaseText
                        typography={Typography.bodyRegular.small}
                        color={theme.subtext}
                      >
                        {item.name}
                      </BaseText>
                    )}
                  </View>
                  <View style={styles.checkboxContainer}>
                    {isSelected ? (
                      <CheckCircleIcon
                        width={24}
                        height={24}
                        color={theme.primaryBlue}
                      />
                    ) : (
                      <View style={styles.uncheckedCircle} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardAvoid: {
      flex: 1,
    },
    groupNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      gap: 8,
    },
    groupNameInput: {
      flex: 1,
      paddingVertical: 4,
    },
    inputContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },
    toWhomInput: {
      flex: 1,
      marginLeft: 8,
      paddingVertical: 4,
    },
    selectedSection: {
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      paddingVertical: 12,
    },
    selectedList: {
      paddingHorizontal: 16,
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.input,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 16,
      gap: 8,
    },
    chipText: {
      maxWidth: 100,
    },
    suggestionListContent: {
      paddingBottom: 24,
    },
    suggestionHeader: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    suggestionItems: {
      gap: 4,
    },
    contactContainer: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    contactInfo: {
      flex: 1,
    },
    checkboxContainer: {
      marginLeft: 'auto',
      justifyContent: 'center',
      alignItems: 'center',
    },
    uncheckedCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.border,
    },
  });

export default NewGroupMessage;
