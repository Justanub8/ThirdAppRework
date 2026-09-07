import { BaseText } from '../rn-components';
import { Typography } from '~/constants';
import * as React from 'react'
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme, Theme } from '~/hooks';

const CustomHeader = ({
    title,
    RightComponent,
    LeftComponent,
}: {
    title?: string,
    RightComponent?: React.JSX.Element,
    LeftComponent?: React.JSX.Element,
}) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const styles = React.useMemo(() => getStyles(theme), [theme]);
    return (
        <View style = {{paddingTop: 0}}>
            <View style = {styles.container}>
                <View style={{ zIndex: 1 }}>
                    {LeftComponent}
                </View>
                
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: 0 }]}>
                    <BaseText typography={Typography.bodyBold.large}>
                        {title}
                    </BaseText>
                </View>

                <View style={{ zIndex: 1 }}>
                    {RightComponent}
                </View>
            </View>
        </View>
    )
}

const getStyles =(theme: Theme) =>  StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        marginHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.divider
    }
})

export default CustomHeader