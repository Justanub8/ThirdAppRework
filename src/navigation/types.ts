import type { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IProfileUser } from '~/interfaces';

export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    App: NavigatorScreenParams<AuthenticatedStackParamList>;
}

export type AuthStackParamList = {
    Login: undefined;
    SignUp: undefined;
}

export type AuthenticatedStackParamList = {
    Main: NavigatorScreenParams<MainTabParamList>;
    Conversation: {id: string, name?: string},
    NewMessage: undefined,
    UserProfile: {id: string},
    CreateContent: undefined,
    CreatePost: {uri: string},
}

export type MainTabParamList = {
    HomeScreen: undefined,
    Reels: undefined,
    Message: undefined,
    Explore: undefined,
    Profile: undefined,
}

export type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export type AuthenticatedScreenNavigationProp = NativeStackNavigationProp<AuthenticatedStackParamList>;