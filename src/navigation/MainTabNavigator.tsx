import * as React from 'react';
import { StyleSheet } from 'react-native';
import { MainTabParamList } from './types';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '~/screens/homescreen/HomeScreen';
import Reels from '~/screens/reels/Reels';
import Message from '~/screens/message/MessageScreen';
import Explore from '~/screens/explore/Explore';
import Profile from '~/screens/profile/Profile';
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
  borderColor,
}: {
  focused: boolean;
  url?: string;
  borderColor: string;
}) => (
  <Avatar
    url={url}
    size={28}
    disabled
    style={focused ? [styles.focusedAvatar, { borderColor }] : undefined}
  />
);

const styles = StyleSheet.create({
  focusedAvatar: {
    borderWidth: 2,
    borderRadius: 9999,
  },
});

const MainTabNavigator: React.FC = () => {
  const { theme } = useTheme();
  const currentUser = useAuthStore(state => state.user);

  const renderProfileIcon = React.useCallback(
    (props: { focused: boolean }) => (
      <ProfileTabIcon
        focused={props.focused}
        url={currentUser?.avatarUrl || currentUser?.imageUrl}
        borderColor={theme.text}
      />
    ),
    [currentUser?.avatarUrl, currentUser?.imageUrl, theme.text]
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        tabBarShowLabel: false,
      }}
    >
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

export default React.memo(MainTabNavigator);
