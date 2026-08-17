import { BaseTextInputProps, BaseText, BaseTextInput } from '../rn-components';
import { commonStyles, Typography } from '~/constants';
import { SizedBox } from '../separate-components';


import * as React from 'react'
import { StyleSheet, TextInput, View, ViewStyle } from "react-native";

const PrimaryField = ({
    title,
    value,
    RightComponent,
    paddingVertical,
    disabled = true,
    autofocus = true,
    onChangeText,
    keyboardType,
    inputRef,
    valueColor,
} : {
    title?: string,
    value?: string,
    paddingVertical?: ViewStyle['paddingVertical'];
    RightComponent?: React.JSX.Element,
    disabled?: boolean,
    autofocus?: boolean,
    keyboardType?: BaseTextInputProps['keyboardType'],
    onChangeText?(text: string): void;
    inputRef?: React.RefObject<TextInput | null>;
    valueColor?: string;
}) => {
    return(
        <View style = {[styles.container, {paddingVertical}]}>
            <View style = {commonStyles.flex}>
                <BaseText 
                    color = {'#616161'}
                    typography = {Typography.bodyMedium.medium}
                >
                    {title}
                </BaseText>
                <SizedBox height={10}/>
                <View>
                    {!disabled ? (
                        <BaseTextInput
                        ref={inputRef}
                        style={commonStyles.flex}
                        color={'#212121'}
                        typography={Typography.bodyBold.xxLarge}
                        value={value}
                        autoFocus={autofocus}
                        keyboardType={keyboardType}
                        onChangeText={ v => {
                            if(onChangeText) {
                                const textWithoutComa = v.replace(/,/g, '');
                                const split = textWithoutComa?.split('.')
                                onChangeText(split.slice(0,2)?.join('.'))
                            }
                        }}
                        /> 
                    ) : (
                        <BaseText
                        color={!valueColor ? '#212121' : valueColor}
                        typography={Typography.bodyBold.xxLarge}>
                            {value}
                        </BaseText>
                    )}
                </View>
            </View>
            {RightComponent}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})

export default PrimaryField