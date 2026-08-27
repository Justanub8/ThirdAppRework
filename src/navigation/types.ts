import type { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    App: NavigatorScreenParams<AuthenticatedStackParamList>;
};

export type AuthStackParamList = {
    Login: undefined;
    SignUp: undefined;
};

export type AuthenticatedStackParamList = {
    Main: NavigatorScreenParams<MainTabParamList>;
    Conversation: { id: string; name?: string };
    NewMessage: undefined;
    UserProfile: { id: string };
    CreateContent: undefined;
    CreatePost: { uri: string };
};

export type MainTabParamList = {
    HomeScreen: undefined;
    Reels: undefined;
    Message: undefined;
    Explore: undefined;
    Profile: undefined;
};

// Global type declaration for React Navigation
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}

// Navigation Props helpers
export type AuthScreenProps<T extends keyof AuthStackParamList> = 
    NativeStackScreenProps<AuthStackParamList, T>;

export type AuthenticatedScreenProps<T extends keyof AuthenticatedStackParamList> = 
    NativeStackScreenProps<AuthenticatedStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
    BottomTabScreenProps<MainTabParamList, T>;

export type AppNavigationProp = NativeStackNavigationProp<AuthenticatedStackParamList>;