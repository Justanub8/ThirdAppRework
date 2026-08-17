import React, { PropsWithChildren} from 'react'
import { View, ViewStyle } from 'react-native'
import { COLORS } from '~/constants';

type Props = {
    width?: ViewStyle['width'];
    height?: ViewStyle['height'];
    backgroundColor?: string;
    borderRadius?: number; 
};
const SizedBox = ({
    width = undefined,
    height = undefined,
    backgroundColor= COLORS.transparent,
    children,
    borderRadius,
}: PropsWithChildren<Props>) => {
    return(
        <View 
        style = {{
            width: width,
            height: height,
            backgroundColor,
            borderRadius,
        }}
        >
            {children}
        </View>
    )
}

export default SizedBox