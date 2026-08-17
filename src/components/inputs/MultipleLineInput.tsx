import * as React from 'react'
import { StyleSheet, View, Pressable, TextInput, ViewStyle, StyleProp, TextInputProps } from 'react-native'
import { Typography } from '~/constants';
import { BaseTextInput } from '../rn-components'

interface MultipleLineInputProps extends TextInputProps{
    maxLine?: number,
    containerStyle?: StyleProp<ViewStyle>,
    disabled?: boolean;
}

const MultipleLineInput = ({
    maxLine = 3,
    containerStyle,
    disabled,
    ...restProps
}: MultipleLineInputProps) =>{
    const [isFocused, setIsFocused] = React.useState(false)
    const ref = React.useRef<TextInput>(null);
    return (
        <Pressable
        disabled = { disabled}
        onPress={() => {
            ref.current?.focus();        
            }}
            style = {[
                styles.message,
                isFocused && styles.focused,
                {
                    minHeight: 28 + 22.4* maxLine
                },
                containerStyle
            ]}>
            <BaseTextInput
            multiline = {true}
            ref = {ref}
            numberOfLines={3}
            lineHeight={22.4}
            typography={Typography.bodySemiBold.large}
            color={'#212121'}
            placeholderTextColor={'#9e9e9e'}
            onFocus={() => {
                setIsFocused(true);
            }}
            onBlur={() => {
                setIsFocused(false);
            }}
            {...restProps}/>
            {disabled && 
            <View style={[styles.disabled]}/>
    
            }
        </Pressable>
    )
}

const styles = StyleSheet.create({
    message: {
        borderRadius: 16,
        backgroundColor: '#fafafa',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#fafafa',
    },
    focused: {
        borderColor: '#246BFD',
        backgroundColor: 'rgba(36, 107, 253, 0.08)'
    },
    disabled: {
        ...StyleSheet.absoluteFill,
        zIndex: 100,
    },
})

export default MultipleLineInput