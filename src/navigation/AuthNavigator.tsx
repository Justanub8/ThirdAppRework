import * as React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthStackParamList } from './types'
import Login from '~/screens/auth/Login';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
    return (
        <Stack.Navigator 
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen
                name="Login"
                component={Login}
            />
        </Stack.Navigator>
    );
}

export default React.memo(AuthNavigator)