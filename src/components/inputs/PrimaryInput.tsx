import { BaseTextInput, BaseTextInputProps } from "../rn-components";
import { SizedBox } from "../separate-components";
import { Typography } from "~/constants";
import * as React from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { SvgProps } from "react-native-svg";
import { useState, useMemo } from "react";
import { useTheme } from "~/hooks";

interface PrimaryInputProps extends BaseTextInputProps {
    RightComponent?: React.FC<SvgProps> | React.ReactNode;
    LeftComponent?: React.FC<SvgProps> | React.ReactNode;
}

const PrimaryInput = ({
    LeftComponent,
    RightComponent,
    ...textProps
}: PrimaryInputProps) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const ref = React.useRef<TextInput>(null);
    const iconColor = useMemo(() => {
        if (isFocused) {
            return theme.facebookBlue ?? '#246BFD';
        }
        if (textProps?.value){
            return theme.icon;
        }
        return theme.placeholder ?? '#9e9e9e';
    }, [textProps?.value, isFocused, theme]);

    return (
        <TouchableOpacity
            onPress={() => {
                ref.current?.focus();
            }}
            activeOpacity={0.7}
            style={[
                styles.container,
                { backgroundColor: theme.input, borderColor: isFocused ? (theme.facebookBlue ?? '#246BFD') : theme.input },
                isFocused && styles.focused,
            ]}
        >
            {!!LeftComponent && ( 
                <>
                    {React.isValidElement(LeftComponent) ? (
                        LeftComponent
                    ) : (typeof LeftComponent === 'function' || typeof LeftComponent === 'object') ? (
                        React.createElement(LeftComponent as any, { width: 24, height: 24, color: iconColor })
                    ) : (
                        LeftComponent
                    )}
                    <SizedBox width={4} />
                </>
            )}
            <BaseTextInput
                ref={ref}
                typography={
                    textProps?.value
                    ? Typography.bodySemiBold.large
                    : Typography.bodyRegular.large
                }
                placeholderTextColor={textProps.placeholderTextColor ?? theme.placeholder ?? '#9e9e9e'}
                style={styles.input}
                onFocus={() => {
                    setIsFocused(true);
                }}
                onBlur={() => {
                    setIsFocused(false);
                }}
                {...textProps}
            />
            {!!RightComponent && (
                <>
                    <SizedBox width={12}/>
                    {React.isValidElement(RightComponent) ? (
                        RightComponent
                    ) : (typeof RightComponent === 'function' || typeof RightComponent === 'object') ? (
                        React.createElement(RightComponent as any, { width: 20, height: 20, color: iconColor })
                    ) : (
                        RightComponent
                    )}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
        borderRadius: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    focused : {
        borderColor: '#246BFD',
    },
    input: {
        flex: 1,
    },
});

export default PrimaryInput;