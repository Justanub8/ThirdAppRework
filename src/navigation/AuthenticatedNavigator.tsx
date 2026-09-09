import * as React from 'react'
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthenticatedStackParamList } from "./types";
import MainTabNavigator from './MainTabNavigator';
import Conversation from '~/screens/conversation/Conversation';
import NewMessage from '~/screens/new-message/NewMessage';
import UserProfile from '~/screens/user-profile/UserProfile';
import CreateContent from '~/screens/createContent/CreateContent';
import CreatePost from '~/screens/createPost/CreatePost';
import Story from '~/screens/story/Story';

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
            <Stack.Screen name='CreateContent' component={CreateContent}/>
            <Stack.Screen name='CreatePost' component={CreatePost}/>
            <Stack.Screen name='Story' component={Story}/>
        </Stack.Navigator>
    )
}

export default React.memo(AuthenticatedNavigator);