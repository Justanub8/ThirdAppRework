import * as React from 'react'
import { ActivityIndicator, StyleSheet, View } from "react-native";

const CoverLoadingView = () => {
    return (
        <View style = { styles.container}>
            <ActivityIndicator color={'#246BFD'}/>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(9, 16, 29, 0.2)'
    }
})
export default CoverLoadingView