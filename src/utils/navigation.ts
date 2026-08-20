import { StackActions, createNavigationContainerRef } from "@react-navigation/native";
import { SheetManager } from "react-native-actions-sheet";
import { IProfileUser } from "~/interfaces";
import { RootStackParamList } from "~/navigation/types";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
export const Navigation = {
    goBack: () => {
        SheetManager.hideAll();
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
        SheetManager.hideAll();
        if (navigationRef.isReady()){
            navigationRef.dispatch(StackActions.pop(count ?? 1));
        }
    },
    
    goToSignUp: () => {
        SheetManager.hideAll();
        if(navigationRef.isReady()){
            navigationRef.navigate('Auth', {
                screen: "SignUp"
            })
        }
    },

    goToReels: () => {
        SheetManager.hideAll();
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
        SheetManager.hideAll();
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
        SheetManager.hideAll();
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
        SheetManager.hideAll();
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
        SheetManager.hideAll();
        if (navigationRef.isReady()){
            navigationRef.navigate("App", {
                screen: 'Conversation',
                params: {id, name}
            });
        }
    },

    goToNewMessage: () => {
        SheetManager.hideAll();
        if(navigationRef.isReady()){
            navigationRef.navigate('App', {
                screen: 'NewMessage'
            })
        }
    },

    goToUserProfile: (id: string) => {
        SheetManager.hideAll();
        if(navigationRef.isReady()){
            navigationRef.navigate('App',{
                screen: 'UserProfile',
                params: {id}
            })
        }
    },

    goToCreateContent: () => {
        SheetManager.hideAll();
        if(navigationRef.isReady()){
            navigationRef.navigate('App' , {
                screen: 'CreateContent'
            })
        }
    },

    goToCreatePost: (uri: string) => {
        SheetManager.hideAll();
        if(navigationRef.isReady()){
            navigationRef.navigate('App' , {
                screen: 'CreatePost',
                params: {uri}
            })
        }
    }
};