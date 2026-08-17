import * as React from 'react'
import { MainTabParamList } from './types'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '~/screens/homescreen/HomeScreen';
import Reels from '~/screens/reels/Reels';
import Message from '~/screens/message/MessageScreen';
import Explore from '~/screens/explore/Explore';
import Profile from '~/screens/profile/Profile';
import { COLORS } from '~/constants';
import { HomeBoldIcon, HomeLightIcon, MessageBoldIcon, MessageLightIcon, ReelBoldIcon, ReelLightIcon, SearchBoldIcon, SearchLightIcon } from '~/assets/svgs';
import { FastImage } from '~/components/rn-components';
import { images } from '~/assets/images';
const ICON_SIZE = 36;
const Tab = createBottomTabNavigator<MainTabParamList>();
const MainTabNavigator: React.FC = () => {
    
    return (
        <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: COLORS.background,
                borderTopColor: COLORS.border
            },
            tabBarShowLabel: false
        }}
        >
            <Tab.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{
                    tabBarIcon(props){
                        return props.focused ? (
                            <HomeBoldIcon width={ICON_SIZE} height={ICON_SIZE}/>
                        ) : (
                            <HomeLightIcon width={ICON_SIZE} height={ICON_SIZE} />
                        )
                    }
                }}
            />
            <Tab.Screen
                name="Reels"
                component={Reels}
                options={{
                    tabBarIcon(props){
                        return props.focused ? (
                            <ReelBoldIcon width={ICON_SIZE} height={ICON_SIZE}/>
                        ) : (
                            <ReelLightIcon width={ICON_SIZE} height={ICON_SIZE}/>
                        )
                    }
                }}
            />
            <Tab.Screen
                name="Message"
                component={Message}
                options={{
                    tabBarIcon(props){
                        return props.focused ? (
                            <MessageBoldIcon width={ICON_SIZE} height={ICON_SIZE}/>
                        ) : (
                            <MessageLightIcon width={ICON_SIZE} height={ICON_SIZE}/>
                        )
                    }
                }}
            />
            <Tab.Screen
                name="Explore"
                component={Explore}
                options={{
                    tabBarIcon(props){
                        return props.focused ? (
                            <SearchBoldIcon width={ICON_SIZE} height={ICON_SIZE}/>
                        ) : (
                            <SearchLightIcon width={ICON_SIZE} height={ICON_SIZE}/>
                        )
                    }
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarIcon(props){
                        return props.focused ? (
                            <FastImage source={images.avater_random} style={{height: ICON_SIZE, width: ICON_SIZE, borderRadius: 9999, borderWidth: 1, borderColor: "#000000"}}/>
                        ) : (
                            <FastImage source={images.avater_random} style={{height: ICON_SIZE, width: ICON_SIZE, borderRadius: 9999, borderWidth: 1, borderColor: COLORS.border}}/>
                        )
                    }
                }}
            />
        </Tab.Navigator>
    )
}

export default React.memo(MainTabNavigator);