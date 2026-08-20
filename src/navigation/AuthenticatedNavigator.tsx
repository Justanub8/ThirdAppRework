import * as React from 'react'
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthenticatedStackParamList } from "./types";
import MainTabNavigator from './MainTabNavigator';
import Conversation from '~/screens/conversation/Conversation';
import NewMessage from '~/screens/new-message/NewMessage';
import UserProfile from '~/screens/user-profile/UserProfile';
import createPost from '~/screens/createContent/CreatePost';

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
            <Stack.Screen name='CreatePost' component={createPost}/>
        </Stack.Navigator>
    )
}

export default React.memo(AuthenticatedNavigator);