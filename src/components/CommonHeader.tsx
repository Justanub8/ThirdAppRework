import { BaseText } from "@components/rn-components";
import typography from "@themes/typography";
import * as React from 'react'
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeftArrow } from "@assets/svgs";
import { useNavigation } from "@react-navigation/native";

const CommonHeader = ({
    title,
}: {
    title?: string,
}) => {
    const navigation = useNavigation();
    const {top} = useSafeAreaInsets();
    return (
        <View style = {{paddingTop: top}}>
            <View style = {styles.container}>
                <LeftArrow height={36} width={36} onPress={() => {navigation.goBack()}}/>
                <View style = {[{flex: 1, justifyContent:'center', alignItems: 'center'},StyleSheet.absoluteFill]}>
                    <BaseText typography={typography.bodyBold.large}>
                        {title}
                    </BaseText>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        marginHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    }
})

export default CommonHeader