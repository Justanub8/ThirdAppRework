import * as React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AuthNavigator from './AuthNavigator'
import AuthenticatedNavigator from './AuthenticatedNavigator'
import { RootStackParamList } from './types'
import { useAuthStore } from '~/hooks'

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
    const { user, accessToken } = useAuthStore();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user && accessToken ? (
                <Stack.Screen
                    name="App"
                    component={AuthenticatedNavigator}
                />
            ) : (
                <Stack.Screen
                    name="Auth"
                    component={AuthNavigator}
                />
            )}
        </Stack.Navigator>
    )
}

export default React.memo(RootNavigator);