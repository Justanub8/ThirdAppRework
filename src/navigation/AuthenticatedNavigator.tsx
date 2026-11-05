import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthenticatedStackParamList } from '~/navigation/types';
import MainTabNavigator from '~/navigation/MainTabNavigator';
import {
  Conversation,
  NewMessage,
  UserProfile,
  CreatePost,
  Story,
  CreateStory,
  MyActiveStory,
  CameraScreen,
  CreateReel,
  DetailMedia,
  Setting,
  NewGroupMessage,
  ConversationDetail,
  EditProfile,
  ConversationNickname,
  ConversationPinned,
} from '~/screens';

const Stack = createNativeStackNavigator<AuthenticatedStackParamList>();

const AuthenticatedNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Conversation" component={Conversation} />
      <Stack.Screen name="NewMessage" component={NewMessage} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="Story" component={Story} />
      <Stack.Screen name="CreateStory" component={CreateStory} />
      <Stack.Screen name="CreateReel" component={CreateReel} />
      <Stack.Screen name="MyActiveStory" component={MyActiveStory} />
      <Stack.Screen name="CameraScreen" component={CameraScreen} />
      <Stack.Screen name="DetailMedia" component={DetailMedia} />
      <Stack.Screen name="Setting" component={Setting} />
      <Stack.Screen name="NewGroupMessage" component={NewGroupMessage} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ConversationDetail" component={ConversationDetail} />
      <Stack.Screen name="ConversationNickname" component={ConversationNickname}/>
      <Stack.Screen name="ConversationPinned" component={ConversationPinned}/>
    </Stack.Navigator>
  );
};

export default React.memo(AuthenticatedNavigator);
