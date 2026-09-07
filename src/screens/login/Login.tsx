import { View, Dimensions, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import React from 'react';
import FastImage from '@d11/react-native-fast-image';
import { images } from '~/assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextButton, PrimaryButton } from '~/components/buttons';
import { PrimaryInput } from '~/components/inputs';
import { SizedBox } from '~/components/separate-components';
import { BaseText } from '~/components/rn-components';
import { FacebookIcon } from '~/assets/svgs';
import { useLogin, useTheme } from '~/hooks';
import { Navigation } from '~/utils';

const Login = () => {
    const { theme } = useTheme();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const mutationLogin = useLogin();
    const onLogin = () => {
        mutationLogin.mutate({ email, password });
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardAvoid}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <FastImage source={images.logo_transparent} resizeMode='contain' style={styles.logo}/>
                    <PrimaryInput
                        value={email}
                        placeholder='Email'
                        onChangeText={setEmail}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    <SizedBox height={16}/>
                    <PrimaryInput
                        value={password}
                        placeholder='Password'
                        onChangeText={setPassword}
                        autoCorrect={false}
                        autoCapitalize="none"
                        secureTextEntry
                        onSubmitEditing={onLogin}
                    />
                    <SizedBox height={16}/>
                    <TextButton
                        title='Forgot Password?'
                        color={theme.blue}
                        style={styles.alignEnd}
                    />
                    <SizedBox height={36}/>
                    <PrimaryButton
                        title='Login'
                        onPress={onLogin}
                    />
                    <SizedBox height={36}/>
                    <View style={styles.facebookRow}>
                        <FacebookIcon height={20} width={20} color={theme.facebookBlue}/>
                        <TextButton
                            title='Login with Facebook'
                            color={theme.blue}
                            style={styles.alignCenter}
                        />
                    </View>
                    <SizedBox height={24}/>
                    <View style={styles.orDividerRow}>
                        <SizedBox height={1} backgroundColor={theme.divider} width={'40%'}/>
                        <BaseText color={theme.grey}>
                        OR
                        </BaseText>
                        <SizedBox height={1} backgroundColor={theme.divider} width={'40%'}/>
                    </View>
                    <SizedBox height={24}/>
                    <View style={styles.signUpRow}>
                        <BaseText color={theme.muted}>
                            Don't have an account?
                        </BaseText>
                        <TextButton
                            title='Sign up.'
                            style={{ color: theme.blue }}
                            onPress={() => Navigation.goToSignUp()}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 8,
        flexGrow: 1,
        justifyContent: 'center',
    },
    logo: {
        alignSelf: 'center',
        width: 200,
        height: 180,
    },
    alignEnd: {
        alignSelf: 'flex-end',
    },
    alignCenter: {
        alignSelf: 'center',
    },
    facebookRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: 8,
    },
    orDividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
        gap: 16,
    },
    signUpRow: {
        flexDirection: 'row',
        alignSelf: 'center',
        gap: 4,
    },
    background: {
        position: 'absolute',
        bottom: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 2,
    },
});

export default Login;