import { View, Dimensions, StyleSheet, KeyboardAvoidingView } from 'react-native'
import React from 'react'
import { commonStyles } from '~/constants'
import FastImage from '@d11/react-native-fast-image'
import { images } from '~/assets/images'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TextButton, PrimaryButton } from '~/components/buttons'
import { PrimaryInput } from '~/components/inputs'
import { SizedBox } from '~/components/separate-components'
import { BaseText } from '~/components/rn-components'
import { FacebookIcon } from '~/assets/svgs'
import { useLogin } from '~/hooks';
const Login = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const mutationLogin = useLogin();
    const onLogin = () => {
        mutationLogin.mutate({email, password});
    };
  return (
    <SafeAreaView edges={['top']} style={commonStyles.container}>
        <KeyboardAvoidingView
            behavior={'padding'}
            style={[commonStyles.paddingScrollHorizontal, {flex: 1}]}
        >
            <FastImage source={images.logo_transparent} resizeMode='contain' style={styles.logo}/>
            <PrimaryInput
                value = {email}
                placeholder='Email'
                onChangeText={setEmail}
                autoCorrect={false}
                autoCapitalize="none"
            />
            <SizedBox height={16}/>
            <PrimaryInput
                value = {password}
                placeholder='Password'
                onChangeText={setPassword}
                autoCorrect={false}
                autoCapitalize="none"
            />
            <SizedBox height={16}/>
            <TextButton
                title='Forgot Password?'
                color= {'#3797EF'}
                style= {commonStyles.alignSelfEnd}
            />
            <SizedBox height={36}/>
            <PrimaryButton
                title='Login'
                onPress={onLogin}
            />
            <SizedBox height={36}/>
            <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.alignSelfCenter, commonStyles.gap8]}>
                <FacebookIcon height={20} width={20} color={'#246BFD'}/>
                <TextButton
                    title='Login with Facebook'
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
            <View 
                style = {[commonStyles.flexRow , commonStyles.alignSelfCenter, commonStyles.gap4]}
            >
                <BaseText
                    color={'#9e9e9e'}
                >
                    Don't have an account?
                </BaseText>
                <TextButton
                    title='Sign up.'
                    style = {{color: '#3797EF'}}
                />
            </View>
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
})

export default Login