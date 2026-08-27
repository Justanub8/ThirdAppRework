import { StyleSheet } from "react-native";
export const COLORS ={
    background: "#ffffff",
    blue: "#445efe",
    grey: "#eef0f6",
    transparent: 'transparent',
    border: "#9e9e9e"
} as const  

export const FONT_FAMILY = {
    thin: 'SFProDisplay-Thin',
    thinItalic: 'SFProDisplay-ThinItalic',

    light: 'SFProDisplay-Light',
    lightItalic: 'SFProDisplay-LightItalic',

    regular: 'SFProDisplay-Regular',
    regularItalic: 'SFProDisplay-RegularItalic',

    medium: 'SFProDisplay-Medium',
    mediumItalic: 'SFProDisplay-MediumItalic',

    semibold: 'SFProDisplay-SemiBold',
    semiboldItalic: 'SFProDisplay-SemiBoldItalic',

    bold: 'SFProDisplay-Bold',
    boldItalic: 'SFProDisplay-BoldItalic',

    extraBold: 'SFProDisplay-ExtraBold',
    extraBoldItalic: 'SFProDisplay-ExtraBoldItalic',
    
    black: 'SFProDisplay-Black',
    blackItalic: 'SFProDisplay-BlackItalic',
} as const 

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const 

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Typography = {
    heading: StyleSheet.create({
        x1: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 48,
            fontWeight: 'bold',
        },
        x2: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 40,
            fontWeight: 'bold',
        },
        x3: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 32,
            fontWeight: 'bold',
        },
        x4: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 24,
            fontWeight: 'bold',
        },
        x5: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 20,
            fontWeight: 'bold',
        },
        x6: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 18,
            fontWeight: 'bold',
        },
        }),

    bodyBold: StyleSheet.create({
        xxxLarge: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 24,
            fontWeight: 'bold',
        },
        xxLarge: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 20,
            fontWeight: 'bold',
        },
        xLarge: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 18,
            fontWeight: 'bold',
        },
        large: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 16,
            fontWeight: 'bold',
        },
        medium: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 14,
            fontWeight: 'bold',
        },
        small: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 12,
            fontWeight: 'bold',
        },
        xSmall: {
            fontFamily: FONT_FAMILY.bold,
            fontSize: 10,
            fontWeight: 'bold',
        },
        }),

    bodySemiBold: StyleSheet.create({
        xxLarge: {
            fontFamily: FONT_FAMILY.semibold,
            fontSize: 20,
            fontWeight: 'semibold',
        },
        xLarge: {
            fontFamily: FONT_FAMILY.semibold,
            fontSize: 18,
            fontWeight: 'semibold',
        },
        large: {
            fontFamily: FONT_FAMILY.semibold,
            fontSize: 16,
            fontWeight: 'semibold',
        },
        medium: {
            fontFamily: FONT_FAMILY.semibold,
            fontSize: 14,
            fontWeight: 'semibold',
        },
        small: {
            fontFamily: FONT_FAMILY.semibold,
            fontSize: 12,
            fontWeight: 'semibold',
        },
        xSmall: {
            fontFamily: FONT_FAMILY.semibold,
            fontSize: 10,
            fontWeight: 'semibold',
        },
        }),

    bodyMedium: StyleSheet.create({
        xxLarge: {
            fontFamily: FONT_FAMILY.medium,
            fontSize: 20,
            fontWeight: 'medium',
        },
        xLarge: {
            fontFamily: FONT_FAMILY.medium,
            fontSize: 18,
            fontWeight: 'medium',
        },
        large: {
            fontFamily: FONT_FAMILY.medium,
            fontSize: 16,
            fontWeight: 'medium',
        },
        medium: {
            fontFamily: FONT_FAMILY.medium,
            fontSize: 14,
            fontWeight: 'medium',
        },
        small: {
            fontFamily: FONT_FAMILY.medium,
            fontSize: 12,
            fontWeight: 'medium',
        },
        xSmall: {
            fontFamily: FONT_FAMILY.medium,
            fontSize: 10,
            fontWeight: 'medium',
        },
        }),

    bodyRegular: StyleSheet.create({
        xxLarge: {
            fontFamily: FONT_FAMILY.regular,
            fontSize: 20,
            fontWeight: 'regular',
        },
        xLarge: {
            fontFamily: FONT_FAMILY.regular,
            fontSize: 18,
            fontWeight: 'regular',
        },
        large: {
            fontFamily: FONT_FAMILY.regular,
            fontSize: 16,
            fontWeight: 'regular',
        },
        medium: {
            fontFamily: FONT_FAMILY.regular,
            fontSize: 14,
            fontWeight: 'regular',
        },
        small: {
            fontFamily: FONT_FAMILY.regular,
            fontSize: 12,
            fontWeight: 'regular',
        },
        xSmall: {
            fontFamily: FONT_FAMILY.regular,
            fontSize: 10,
            fontWeight: 'regular',
        },
        }),
};
