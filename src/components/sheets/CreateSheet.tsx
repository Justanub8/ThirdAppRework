import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useTheme, Theme } from '~/hooks'
import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import { BaseText } from '../rn-components';
import { Typography } from '~/constants';
import { Navigation } from '~/utils';

const CreateSheet = (props: SheetProps<"CreateSheet">) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
  return (
    <ActionSheet
        id={props.sheetId}
        gestureEnabled={true}
        closeOnTouchBackdrop={true}
        closeOnPressBack={true}
        indicatorStyle={styles.indicator}
        containerStyle={styles.container}
    >
        <View style={{flex: 1}}>
            <View style={styles.header}>
                <BaseText style={styles.title}>Tạo mới</BaseText>
            </View>
            <TouchableOpacity style={styles.item} onPress={() => Navigation.goToSelectPostMedia()}>
                <BaseText typography={Typography.bodyBold.large}>Bài viết</BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => Navigation.goToSelectStoryMedia()}>
                <BaseText typography={Typography.bodyBold.large}>Tin</BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.item}>
                <BaseText typography={Typography.bodyBold.large}>Tin nổi bật</BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.item}>
                <BaseText typography={Typography.bodyBold.large}>Video trực tiếp</BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.item}>
                <BaseText typography={Typography.bodyBold.large}>Reels</BaseText>
            </TouchableOpacity>
        </View>
    </ActionSheet>
  )
}

const getStyles = (theme: Theme) => StyleSheet.create({
    indicator: {
        width: 44,
        height: 5,
        backgroundColor: theme.placeholder,
        borderRadius: 3,
        marginTop: 8,
    },
    container: {
        height: '50%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: theme.sheet,
    },
    header: {
        borderBottomColor: theme.divider,
        borderBottomWidth: 1,
        paddingBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 6,
        textAlign: 'center',
    },
    item: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    }
})

export default CreateSheet