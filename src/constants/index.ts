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
}

export const commonStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  flexRowReverse: {
    flexDirection: 'row-reverse',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexColumnReverse: {
    flexDirection: 'column-reverse',
  },
  alignItemsStart: {
    alignItems: 'flex-start',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  alignItemsEnd: {
    alignItems: 'flex-end',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  justifyAround: {
    justifyContent: 'space-around',
  },
  justifyEvenly: {
    justifyContent: 'space-evenly',
  },
  bgTransparent: {
    backgroundColor: 'transparent',
  },
  alignSelfCenter: {
    alignSelf: 'center',
  },
  alignSelfEnd: {
    alignSelf: 'flex-end',
  },
  alignSelfStart: {
    alignSelf: 'flex-start',
  },
  horizontalLine: {
    height: 1,
  },
  verticalLine: {
    width: 1,
  },
  absolute: {
    position: 'absolute',
  },
  wFull: {width: '100%'},
  gap4: {gap: 4},
  gap8: {gap: 8},
  gap12: {gap: 12},
  gap16: {gap: 16},
  gap24: {gap: 24},
  mt24: {marginTop: 24},
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2.22,

    elevation: 5,
  },
  headerButton: {
    paddingHorizontal: 28,
  },
  padding8: {
    padding: 8,
  },
  paddingHorizontal16: {
    paddingHorizontal: 16,
  },
  paddingVertical4: {
    paddingVertical: 4,
  },
  paddingVertical8: {
    paddingVertical: 8,
  },
  paddingVertical16: {
    paddingVertical: 16,
  },
  paddingVertical24: {
    paddingVertical: 24,
  },
  marginVertical16: {
    marginVertical: 16,
  },
  marginHorizontal16: {
    marginHorizontal: 16,
  },
  paddingScrollHorizontal: {
    paddingHorizontal: 8,
  },
  rtl: {
    transform: [
      {
        scaleX: -1,
      },
    ],
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  testBorder: {
    borderWidth: 1,
    borderColor: '#000000'
  }
});
