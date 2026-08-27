import * as React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthStackParamList } from './types'
import Login from '~/screens/login/Login';
import SignUp from '~/screens/signUp/SignUp';

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
            <Stack.Screen
                name='SignUp'
                component={SignUp}
            />
        </Stack.Navigator>
    );
}

export default React.memo(AuthNavigator)