import { BaseTextInput, BaseTextInputProps } from "../rn-components";
import { SizedBox } from "../separate-components";
import { Typography, commonStyles } from "~/constants";
import * as React from 'react'
import { StyleSheet, TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { SvgProps } from "react-native-svg";
import { useState, useMemo } from "react";
interface PrimaryInputProps extends BaseTextInputProps {
    RightComponent?: React.FC<SvgProps> | React.ReactNode;
    LeftComponent?: React.FC<SvgProps> | React.ReactNode;
}
const PrimaryInput = ({
    LeftComponent,
    RightComponent,
    ...textProps
}: PrimaryInputProps) => {
    const [isFocused, setIsFocused] = useState(false)
    const ref = React.useRef<TextInput>(null);
    const iconColor = useMemo(() => {
        if (isFocused) {
            return '#246BFD';
        }
        if (textProps?.value){
            return '#212121';
        }
        return '#9e9e9e';
    }, [textProps?.value, isFocused])
    return (
        <TouchableOpacity
        onPress={() => {
            ref.current?.focus();
        }}
        activeOpacity={0.7}
        style = {[styles.container, isFocused && styles.focused]}
        >
            {!!LeftComponent && ( 
            <>
                {typeof LeftComponent === 'function' ? (
                    <LeftComponent width={24} height={24} color={iconColor}/>
                ) : (
                    LeftComponent
                )}
                <SizedBox width={4} />
            </>
            )}
            <BaseTextInput
                ref = { ref}
                typography = {
                    textProps?.value
                    ? Typography.bodySemiBold.large
                    : Typography.bodyRegular.large
                }
                placeholderTextColor={'#9e9e9e'}
                style = {commonStyles.flex}
                onFocus={() => {
                    setIsFocused(true);
                }}
                onBlur={() => {
                    setIsFocused(false)
                }}
                {...textProps}
            />
            {!!RightComponent && (
                <>
                    <SizedBox width={12}/>
                    {typeof RightComponent === 'function' ? (
                        <RightComponent width={20} height={20} color={iconColor} />
                    ) : (
                        RightComponent
                    )}
                </>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        borderRadius: 40,
        backgroundColor: '#eeeeee',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(36, 107, 253, 0.08)',
    },
    focused : {
        borderColor: '#246BFD',
        backgroundColor: 'rgba(36, 107, 253, 0.08)',
    }
});

export default PrimaryInput