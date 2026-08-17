import * as React from 'react-native'
import { StyleProp, TextStyle, TextProps } from 'react-native'
import { Typography } from '~/constants';
import Animated from 'react-native-reanimated'

export interface BaseTextProps extends TextProps {
    textAlign?: 'left' | 'right' | 'center';
    textTransform?: TextStyle['textTransform'];
    size?: TextStyle['fontSize'];
    fontFace?: TextStyle['fontFamily'];
    fontWeight?: TextStyle['fontWeight'];
    borderWidth?: TextStyle['borderWidth'];
    borderColor?: TextStyle['borderColor'];
    borderBottomWidth?: TextStyle['borderBottomWidth'];
    borderBottomColor?: TextStyle['borderBottomColor'];
    textDecorationLine?: TextStyle['textDecorationLine'];
    borderTopWidth?: TextStyle['borderTopWidth'];
    borderTopColor?: TextStyle['borderTopColor'];
    borderLeftWidth?: TextStyle['borderLeftWidth'];
    borderLeftColor?: TextStyle['borderLeftColor'];
    borderRightWidth?: TextStyle['borderRightWidth'];
    borderRightColor?: TextStyle['borderRightColor'];
    lineHeight?: TextStyle['lineHeight'];
    color?: TextStyle['color'];
    mt?: TextStyle['marginTop'];
    mb?: TextStyle['marginBottom'];
    ml?: TextStyle['marginLeft'];
    mr?: TextStyle['marginRight'];
    mh?: TextStyle['marginHorizontal'];
    mv?: TextStyle['marginVertical'];
    pt?: TextStyle['paddingTop'];
    pb?: TextStyle['paddingBottom'];
    pl?: TextStyle['paddingLeft'];
    pr?: TextStyle['paddingRight'];
    ph?: TextStyle['paddingHorizontal'];
    pv?: TextStyle['paddingVertical'];
    typography?: StyleProp<TextStyle>;
}

const BaseText = ({
    textAlign = 'left',
    textTransform,
    borderWidth,
    borderBottomColor,
    borderBottomWidth,
    borderColor,
    borderLeftColor,
    borderLeftWidth,
    borderRightColor,
    borderRightWidth,
    borderTopColor,
    borderTopWidth,
    color = '#212121',
    mt,
    mb,
    ml,
    mr,
    mh,
    mv,
    textDecorationLine,
    pt,
    pb,
    pl,
    pr,
    ph,
    pv,
    typography = Typography.bodyRegular.medium,
    ...textProps
}: BaseTextProps) => {
  return (
    <Animated.Text
      {...textProps}
      allowFontScaling={false}
      style={[
        typography,
        {
          color,
          textAlign: textAlign,
          textTransform,
          borderWidth,
          borderBottomColor,
          borderBottomWidth,
          borderColor,
          borderLeftColor,
          borderLeftWidth,
          borderRightColor,
          borderRightWidth,
          borderTopColor,
          borderTopWidth,
          marginTop: mt,
          marginBottom: mb,
          marginLeft: ml,
          marginRight: mr,
          marginHorizontal: mh,
          marginVertical: mv,
          paddingTop: pt,
          paddingBottom: pb,
          paddingLeft: pl,
          paddingRight: pr,
          paddingHorizontal: ph,
          paddingVertical: pv,
          textDecorationLine: textDecorationLine,
        },
        textProps.style,
      ]}
    />
  );
};

export default BaseText;
