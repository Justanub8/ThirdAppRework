import * as React from 'react';
import { StyleSheet } from 'react-native';
import { MainTabParamList } from '~/navigation/types';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  HomeScreen,
  Reels,
  MessageScreen as Message,
  Explore,
  Profile,
} from '~/screens';
import { useTheme, useAuthStore } from '~/hooks';
import {
  HomeBoldIcon,
  HomeLightIcon,
  MessageBoldIcon,
  MessageLightIcon,
  ReelBoldIcon,
  ReelLightIcon,
  SearchBoldIcon,
  SearchLightIcon,
} from '~/assets/svgs';
import { Avatar } from '~/components/avatar';

const ICON_SIZE = 36;
const Tab = createBottomTabNavigator<MainTabParamList>();

const renderHomeIcon = ({ focused }: { focused: boolean }) =>
  focused ? (
    <HomeBoldIcon width={ICON_SIZE} height={ICON_SIZE} />
  ) : (
    <HomeLightIcon width={ICON_SIZE} height={ICON_SIZE} />
  );

const renderReelsIcon = ({ focused }: { focused: boolean }) =>
  focused ? (
    <ReelBoldIcon width={ICON_SIZE} height={ICON_SIZE} />
  ) : (
    <ReelLightIcon width={ICON_SIZE} height={ICON_SIZE} />
  );

const renderMessageIcon = ({ focused }: { focused: boolean }) =>
  focused ? (
    <MessageBoldIcon width={ICON_SIZE} height={ICON_SIZE} />
  ) : (
    <MessageLightIcon width={ICON_SIZE} height={ICON_SIZE} />
  );

const renderExploreIcon = ({ focused }: { focused: boolean }) =>
  focused ? (
    <SearchBoldIcon width={ICON_SIZE} height={ICON_SIZE} />
  ) : (
    <SearchLightIcon width={ICON_SIZE} height={ICON_SIZE} />
  );

const ProfileTabIcon = ({
  focused,
  url,
  focusedStyle,
}: {
  focused: boolean;
  url?: string;
  focusedStyle?: object;
}) => (
  <Avatar
    url={url}
    size={28}
    disabled
    style={focused ? focusedStyle : undefined}
  />
);

const MainTabNavigator: React.FC = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const currentUser = useAuthStore(state => state.user);

  const renderProfileIcon = React.useCallback(
    (props: { focused: boolean }) => (
      <ProfileTabIcon
        focused={props.focused}
        url={currentUser?.avatarUrl || currentUser?.imageUrl}
        focusedStyle={styles.focusedAvatar}
      />
    ),
    [currentUser?.avatarUrl, currentUser?.imageUrl, styles.focusedAvatar],
  );

  const screenOptions = React.useMemo(
    () => ({
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarShowLabel: false,
    }),
    [styles.tabBar],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ tabBarIcon: renderHomeIcon }}
      />
      <Tab.Screen
        name="Reels"
        component={Reels}
        options={{ tabBarIcon: renderReelsIcon }}
      />
      <Tab.Screen
        name="Message"
        component={Message}
        options={{ tabBarIcon: renderMessageIcon }}
      />
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{ tabBarIcon: renderExploreIcon }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ tabBarIcon: renderProfileIcon }}
      />
    </Tab.Navigator>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    focusedAvatar: {
      borderWidth: 2,
      borderRadius: 9999,
      borderColor: theme.text,
    },
    tabBar: {
      backgroundColor: theme.background,
      borderTopColor: theme.border,
    },
  });

export default React.memo(MainTabNavigator);
