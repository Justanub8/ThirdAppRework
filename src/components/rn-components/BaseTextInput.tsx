import * as React from 'react';
import {StyleProp, TextInput, TextInputProps, TextStyle} from 'react-native';
import { FONT_FAMILY } from '~/constants';
export interface BaseTextProps extends TextInputProps {
  textAlign?: 'left' | 'right' | 'center';
  fontFace?: TextStyle['fontFamily'];
  textTransform?: TextStyle['textTransform'];
  lineHeight?: TextStyle['lineHeight'];
  fontWeight?: TextStyle['fontWeight'];
  borderWidth?: TextStyle['borderWidth'];
  borderColor?: TextStyle['borderColor'];
  borderBottomWidth?: TextStyle['borderBottomWidth'];
  borderBottomColor?: TextStyle['borderBottomColor'];
  borderTopWidth?: TextStyle['borderTopWidth'];
  borderTopColor?: TextStyle['borderTopColor'];
  borderLeftWidth?: TextStyle['borderLeftWidth'];
  borderLeftColor?: TextStyle['borderLeftColor'];
  borderRightWidth?: TextStyle['borderRightWidth'];
  borderRightColor?: TextStyle['borderRightColor'];
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

const BaseTextInput = (
  {
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
    pt,
    pb,
    pl,
    pr,
    ph,
    pv = 0,
    typography,
    ...textProps
  }: BaseTextProps,
  ref: React.LegacyRef<TextInput>,
) => {
  return (
    <TextInput
      ref={ref}
      {...textProps}
      allowFontScaling={false}
      style={[
        {fontFamily: FONT_FAMILY.medium},
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
        },
        textProps.style,
      ]}
    />
  );
};

export default React.forwardRef<TextInput, BaseTextProps>(BaseTextInput);
