import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { commonStyles, Typography } from '~/constants'
import FastImage from '@d11/react-native-fast-image'
import { images } from '~/assets/images'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TextButton, PrimaryButton } from '~/components/buttons'
import { SizedBox } from '~/components/separate-components'
import { BaseText, BaseTextInput } from '~/components/rn-components'
import { FacebookIcon } from '~/assets/svgs'
import { Navigation } from '~/utils'
import { KeyboardAvoidingView, Dimensions, StyleSheet } from 'react-native'

import { useAuthMutation } from '~/hooks'

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
    <SafeAreaView edges={['top', 'bottom']} style={commonStyles.container}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView 
                contentContainerStyle={[commonStyles.paddingScrollHorizontal, { flexGrow: 1, paddingBottom: 24 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <FastImage source={images.logo_transparent} resizeMode='contain' style={styles.logo}/>
                <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.alignSelfCenter, commonStyles.gap8]}>
                    <FacebookIcon height={24} width={24} color={'#246BFD'}/>
                    <TextButton
                        title='Login with Facebook'
                        typography={Typography.bodyMedium.large}
                        color={'#3797EF'}
                        style = {commonStyles.alignSelfCenter}
                    />
                </View>
                <SizedBox height={24}/>
                <View
                    style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.wFull, commonStyles.justifyCenter, commonStyles.gap16]}
                >
                    <SizedBox height={1} backgroundColor={'#bdbdbd'} width={'40%'}/>
                    <BaseText color={'#757575'}>
                    OR
                    </BaseText>
                    <SizedBox height={1} backgroundColor={'#bdbdbd'} width={'40%'}/>
                </View>
                <SizedBox height={24}/>
                <BaseTextInput
                    value = {email}
                    placeholder='Mobile Number or Email'
                    onChangeText={setEmail}
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.inputField}
                />
                <SizedBox height={16}/>
                <BaseTextInput
                    value = {fullname}
                    placeholder='Fullname'
                    onChangeText={setFullname}
                    autoCorrect={false}
                    style={styles.inputField}
                />
                <SizedBox height={16}/>
                <BaseTextInput
                    value = {username}
                    placeholder='Username'
                    onChangeText={setUsername}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.inputField}
                />
                <SizedBox height={16}/>
                <BaseTextInput
                    value = {password}
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
                  <BaseText typography={Typography.bodyBold.large} style={{color: "#ffffff"}}>
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
  )
}
const styles = StyleSheet.create({
    logo: {
        alignSelf: 'center',
        width: 200,
        height: 180,
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
})
export default SignUp