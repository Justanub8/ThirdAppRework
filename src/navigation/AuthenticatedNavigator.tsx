import * as React from 'react'
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthenticatedStackParamList } from "./types";
import MainTabNavigator from './MainTabNavigator';
import Conversation from '~/screens/conversation/Conversation';
import NewMessage from '~/screens/new-message/NewMessage';
import UserProfile from '~/screens/user-profile/UserProfile';
import SelectPostMedia from '~/screens/createPost/SelectPostMedia';
import CreatePost from '~/screens/createPost/CreatePost';
import Story from '~/screens/story/Story';
import SelectStoryMedia from '~/screens/create-story/SelectStoryMedia';
import CreateStory from '~/screens/create-story/CreateStory';
import MyActiveStory from '~/screens/story/MyActiveStory';

const Stack = createNativeStackNavigator<AuthenticatedStackParamList>();

const AuthenticatedNavigator: React.FC = () => {
    
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name="Main" component={MainTabNavigator}/>
            <Stack.Screen name="Conversation" component={Conversation}/>
            <Stack.Screen name="NewMessage" component={NewMessage}/>
            <Stack.Screen name='UserProfile' component={UserProfile}/>
            <Stack.Screen name='SelectPostMedia' component={SelectPostMedia}/>
            <Stack.Screen name='CreatePost' component={CreatePost}/>
            <Stack.Screen name='Story' component={Story}/>
            <Stack.Screen name='SelectStoryMedia' component={SelectStoryMedia}/>
            <Stack.Screen name='CreateStory' component={CreateStory}/>
            <Stack.Screen name='MyActiveStory' component={MyActiveStory}/>
        </Stack.Navigator>
    )
}

export default React.memo(AuthenticatedNavigator);