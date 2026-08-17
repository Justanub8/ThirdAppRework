import * as React from 'react'
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
import { BaseText, BaseTextProps } from '../rn-components';
import { SizedBox } from '../separate-components';
import { Typography } from '~/constants';
export interface PrimaryButtonProps {
  color?: ViewStyle['backgroundColor'];
  borderColor?: ViewStyle['borderColor'];
  disabledColor?: ViewStyle['backgroundColor'];
  disabled?: boolean;
  title?: string;
  subTitle?: string;
  textColor?: string;
  subTitleColor?: string;
  disabledTextColor?: string;
  textProps?: BaseTextProps;
  subTitleProps?: BaseTextProps;
  width?: ViewStyle['width'];
  alignSelf?: ViewStyle['alignSelf'];
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  LeftAccessory?: React.JSX.Element;
  RightAccessory?: React.JSX.Element;
}

const PrimaryButton = ({
  color = '#246BFD',
  disabledColor = '#9e9e9e',
  disabledTextColor = '#FFFFFF',
  textColor = '#FFFFFF',
  disabled,
  title,
  width,
  textProps,
  subTitleProps,
  alignSelf,
  style,
  onPress,
  borderColor,
  LeftAccessory,
  RightAccessory,
  subTitle,
  subTitleColor = '#FFFFFF',
}: PrimaryButtonProps) => {
    return(
        <TouchableOpacity
        onPress={onPress}
        disabled = { disabled }
        style = {[
            styles.container,
            {   
                backgroundColor: disabled ? disabledColor : color,
                width,
                alignSelf,
                borderColor: disabled ? disabledColor : borderColor || color,
                paddingHorizontal: title ? 12 : 0,
                paddingVertical: subTitle ? 8 : 16
            },
                style,
        ]}>
        {LeftAccessory ? LeftAccessory: null}
            <SizedBox/>
            <View>
                <BaseText
                textAlign='center'
                color={disabled ? disabledTextColor : textColor}
                typography = { Typography.bodyBold.large}
                {...textProps}
                >
                    {title || ''}
                </BaseText>
                
                {!!subTitle && !disabled && (
                    <BaseText
                    textAlign='center'
                    color = {subTitleColor }
                    typography = { Typography.bodyBold.medium}
                    {...subTitleProps}>
                    {subTitle || ''}
                    </BaseText>
                    )
                }
            </View>
            <SizedBox/>
        {RightAccessory ? RightAccessory : null}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        borderRadius: 8,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
    }
})

export default PrimaryButton