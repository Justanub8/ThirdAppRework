import { StackActions, createNavigationContainerRef } from "@react-navigation/native";
import { IProfileUser } from "~/interfaces";
import { RootStackParamList } from "~/navigation/types";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
export const Navigation = {
    goBack: () => {
        if(navigationRef.isReady()){
            if(navigationRef.canGoBack()){
                navigationRef.goBack()
            } else {
                navigationRef.navigate('App', {
                    screen: 'Main',
                    params: {
                        screen: 'HomeScreen'
                    },
                });
            };
        }
    },

    pop: (count?: number ) => {
        if (navigationRef.isReady()){
            navigationRef.dispatch(StackActions.pop(count ?? 1));
        }
    },
    
    goToSignUp: () => {
        if(navigationRef.isReady()){
            navigationRef.navigate('Auth', {
                screen: "SignUp"
            })
        }
    },

    goToReels: () => {
        if (navigationRef.isReady()) {
        navigationRef.navigate('App', {
            screen: 'Main',
            params: {
            screen: 'Reels',
            },
        });
        }
    },

    goToMessage: () => {
        if (navigationRef.isReady()) {
        navigationRef.navigate('App', {
            screen: 'Main',
            params: {
            screen: 'Message',
            },
        });
        }
    },

    goToExplore: () => {
        if (navigationRef.isReady()) {
        navigationRef.navigate('App', {
            screen: 'Main',
            params: {
            screen: 'Explore',
            },
        });
        }
    },

    goToProfile: () => {
        if (navigationRef.isReady()) {
        navigationRef.navigate('App', {
            screen: 'Main',
            params: {
            screen: 'Profile',
            },
        });
        }
    },

    goToConversation: (id: string, name?: string) => {
        if (navigationRef.isReady()){
            navigationRef.navigate("App", {
                screen: 'Conversation',
                params: {id, name}
            });
        }
    },

    goToNewMessage: () => {
        if(navigationRef.isReady()){
            navigationRef.navigate('App', {
                screen: 'NewMessage'
            })
        }
    },

    goToUserProfile: (id: string) => {
        if(navigationRef.isReady()){
            navigationRef.navigate('App',{
                screen: 'UserProfile',
                params: {id}
            })
        }
    },

    goToCreatePost: () => {
        if(navigationRef.isReady()){
            navigationRef.navigate('App' , {
                screen: 'CreatePost'
            })
        }
    }
};