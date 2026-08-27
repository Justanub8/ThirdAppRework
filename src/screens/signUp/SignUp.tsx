import { View, TouchableOpacity, Platform, ScrollView, StyleSheet, Dimensions, KeyboardAvoidingView } from 'react-native';
import React from 'react';
import { Typography } from '~/constants';
import FastImage from '@d11/react-native-fast-image';
import { images } from '~/assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextButton } from '~/components/buttons';
import { SizedBox } from '~/components/separate-components';
import { BaseText, BaseTextInput } from '~/components/rn-components';
import { FacebookIcon } from '~/assets/svgs';
import { useAuthMutation } from '~/hooks';

const SignUp = () => {
    const [email, setEmail] = React.useState("");
    const [fullname, setFullname] = React.useState("");
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");

    const { signUp } = useAuthMutation();

    const handleSignUp = () => {
        if (!email.trim() || !username.trim() || !password) {
            return;
        }
        signUp.mutate({
            email: email.trim(),
            username: username.trim(),
            password,
            fullname: fullname.trim()
        });
    };
    
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
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
                <View style={styles.facebookRow}>
                    <FacebookIcon height={24} width={24} color={'#246BFD'}/>
                    <TextButton
                        title='Login with Facebook'
                        typography={Typography.bodyMedium.large}
                        color={'#3797EF'}
                        style={styles.alignCenter}
                    />
                </View>
                <SizedBox height={24}/>
                <View style={styles.orDividerRow}>
                    <SizedBox height={1} backgroundColor={'#bdbdbd'} width={'40%'}/>
                    <BaseText color={'#757575'}>
                    OR
                    </BaseText>
                    <SizedBox height={1} backgroundColor={'#bdbdbd'} width={'40%'}/>
                </View>
                <SizedBox height={24}/>
                <BaseTextInput
                    value={email}
                    placeholder='Mobile Number or Email'
                    onChangeText={setEmail}
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.inputField}
                />
                <SizedBox height={16}/>
                <BaseTextInput
                    value={fullname}
                    placeholder='Fullname'
                    onChangeText={setFullname}
                    autoCorrect={false}
                    style={styles.inputField}
                />
                <SizedBox height={16}/>
                <BaseTextInput
                    value={username}
                    placeholder='Username'
                    onChangeText={setUsername}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.inputField}
                />
                <SizedBox height={16}/>
                <BaseTextInput
                    value={password}
                    placeholder='Password'
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.inputField}
                    onSubmitEditing={handleSignUp}
                />
                <SizedBox height={16}/>
                <TouchableOpacity 
                    style={[styles.signUpButton, signUp.isPending && { opacity: 0.6 }]}
                    onPress={handleSignUp}
                    disabled={signUp.isPending}
                >
                  <BaseText typography={Typography.bodyBold.large} style={{ color: "#ffffff" }}>
                    {signUp.isPending ? 'Signing Up...' : 'Sign Up'}
                  </BaseText>
                </TouchableOpacity>
                <SizedBox height={48}/>
                <View style={styles.termAndPolicyContainer}>
                    <BaseText
                        color={'#9e9e9e'}
                        typography={Typography.bodyRegular.medium}
                        textAlign='center'
                    >
                        By signing up, you agree to our{' '}
                        <BaseText
                            typography={Typography.bodySemiBold.medium}
                            color={'#4A4A4A'}
                            onPress={() => {}}
                        >
                            Terms, Data Policy
                        </BaseText>
                        {' and '}
                        <BaseText
                            typography={Typography.bodySemiBold.medium}
                            color={'#4A4A4A'}
                            onPress={() => {}}
                        >
                            Cookies Policy
                        </BaseText>
                        .
                    </BaseText>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 8,
        flexGrow: 1,
        paddingBottom: 24,
    },
    logo: {
        alignSelf: 'center',
        width: 200,
        height: 180,
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
    background: {
        position: 'absolute',
        bottom: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 2,
    },
    inputField: {
      backgroundColor: '#eae7e7',
      height: 48,
      paddingHorizontal: 8,
      marginHorizontal: 24,
      borderWidth: 1,
      borderRadius: 4
    },
    facebookButton: {
      paddingHorizontal: 24
    },
    termAndPolicyContainer: {
      paddingHorizontal: "20%",
      alignItems: 'center',
      justifyContent: 'center',
    },
    signUpButton: {
      backgroundColor: "#1877F2",
      height: 40,
      marginHorizontal: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 6
    }
});

export default SignUp;