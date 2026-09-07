import * as React from 'react'
import { StyleSheet, View, Pressable, TextInput, ViewStyle, StyleProp, TextInputProps } from 'react-native'
import { Typography } from '~/constants';
import { BaseTextInput } from '../rn-components'
import { useTheme } from '~/hooks';

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
    const { theme } = useTheme();
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
                { backgroundColor: theme.input, borderColor: isFocused ? (theme.facebookBlue ?? '#246BFD') : theme.input },
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
            color={theme.text}
            placeholderTextColor={restProps.placeholderTextColor ?? theme.placeholder ?? '#9e9e9e'}
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
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderWidth: 1,
    },
    focused: {
        borderColor: '#246BFD',
    },
    disabled: {
        ...StyleSheet.absoluteFill,
        zIndex: 100,
    },
})

export default MultipleLineInput