import { PrimaryButton } from "../buttons";
import { BaseText, BaseTextProps } from "../rn-components";
import { SizedBox } from "../separate-components";
import { Typography, commonStyles } from "~/constants";
import * as React from 'react'
import { StyleSheet, View } from "react-native";
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {create} from 'zustand'

type GlobalAlertType = {
    visible: boolean,
    closeOnTouchBackdrop?: boolean;
    title: { text: string; textProp?:BaseTextProps}
    message: { text: string; textProp?:BaseTextProps}
    buttons: {
        id: string,
        title: string,
        titleColor?: string,
        color?: string,
        onPress?(): void;
    }[];
    alert(props : {
        title: {text: string; textProp?: BaseTextProps};
        message: {text: string; textProp?: BaseTextProps};
        buttons: {
            id: string;
            title: string;
            titleColor?: string;
            color?: string;
            onPress?(): void;
        }[];
        onClose?(): void;
        closeOnTouchBackdrop?: boolean;
    }): void;
    onClose?(): void;
    close(): void;
};
const initState: {
    visible: boolean,
    title: { text: string; textProp?:BaseTextProps}
    message: { text: string; textProp?:BaseTextProps}
    buttons: {
        id: string,
        title: string,
        titleColor?: string,
        color?: string,
        onPress?(): void;
    }[];
} = {
    visible: false,
    title: {
        text: '',
        textProp:{
            typography: Typography.heading.x4,
            color: '#3797EF',
            textAlign: 'center',
        },
    },
    message: {
        text: '',
        textProp:{
            typography: Typography.heading.x5,
            color: '#424242',
            textAlign: 'center',
        }
    },
    buttons: []
};
export const useGlobalAlert = create<GlobalAlertType>((set,get) => ({
    ...initState,
    alert(props) {
        const currentState = get();
        set({
            visible: true,
            title: { ...currentState.title, ...props.title},
            message: { ...currentState.message, ...props.message},
            buttons: props.buttons,
            onClose: props?.onClose,
        });
    },
    close(){
        set({
            visible: false,
            title: initState.title,
            message: initState.message,
            buttons: initState.buttons,
        });
    },
}));

const bottomSheetRef = React.createRef<ActionSheetRef>();

const GlobalAlert = () => {
    const {title, message, buttons, onClose, closeOnTouchBackdrop} = 
        useGlobalAlert();
    const {bottom} = useSafeAreaInsets();
    return (
        <ActionSheet
            ref = { bottomSheetRef}
            closeOnTouchBackdrop = { closeOnTouchBackdrop}
            onClose={onClose}
            isModal={false}
            safeAreaInsets={{top: 0, left: 0, bottom: 0, right: 0}}
            containerStyle = {styles.container}
        >
            <View style = {[styles.alert, {paddingBottom: bottom + 16}]}>
                <BaseText
                    mt = {24}
                    mb = {24}
                    color = { '#246BFD' }
                    {...title.textProp}
                >
                    {title.text}
                </BaseText>
                <SizedBox
                    height={1}
                    width={'100%'}
                    backgroundColor={'#eeeeee'}
                />
                <BaseText
                    mt = {24}
                    mb = {24}
                    color = { '#246BFD' }
                    {...message.textProp} 
                >
                    {message.text}
                </BaseText>
                <View 
                    style = {[
                        commonStyles.flexRow,
                        commonStyles.gap12
                    ]}
                >
                    {buttons.map(option => (
                        <PrimaryButton
                            key = {option.id}
                            title={option.title}
                            color={option.color}
                            borderColor={'transparent'}
                            textColor={option.titleColor}
                            style = {commonStyles.flex}
                            onPress={() => {
                                bottomSheetRef?.current?.hide();
                                if(option.onPress){
                                    option.onPress();
                                }
                            }}
                        />
                    ))}
                </View>
            </View>
        </ActionSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        borderTopLeftRadius: 44,
        borderTopRightRadius: 44,
        backgroundColor: '#FFFFFF',
    },
    alert: {
        borderTopLeftRadius: 44,
        borderTopRightRadius: 44,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    handler: {
        width: 38,
        height: 3,
        borderRadius: 3,
        backgroundColor: '#e0e0e0',
        alignSelf: 'center',
        marginTop: 8
    },
});

export default GlobalAlert

const alert = (props: {
    title: {text: string; textProps?: BaseTextProps};
    message: {text: string; textProps?: BaseTextProps};
    buttons: {
        id: string;
        title: string;
        titleColor?: string;
        color?: string;
        onPress?(): void;
    }[];
    onClose?(): void;
    closeOnTouchBackdrop?: boolean;
}) => {
    useGlobalAlert.getState().alert(props);
    bottomSheetRef.current?.show();
}
export {alert}
