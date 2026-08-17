import { BaseText,BaseTextProps } from "../rn-components";
import * as React from 'react'
import { StyleSheet, TouchableOpacity } from "react-native";

interface TextButtonProp extends BaseTextProps{
    title?: string;
    onPress?: () => void;
    disabled?: boolean;
}

const TextButton = ({   
    title,
    onPress,
    disabled,
    ...textProps
}: TextButtonProp) => {
    return (
        <TouchableOpacity
        disabled = {disabled}
        onPress={onPress}
        style= {styles.container}>
            <BaseText {...textProps}>{title}</BaseText>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {},
});

export default TextButton;