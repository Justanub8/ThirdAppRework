import * as React from 'react'
import {
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native'
import MenuTrigger, {MenuTriggerRef} from './MenuTrigger'
import { BaseText } from '../rn-components'
import { Typography } from '~/constants'
import { SvgProps } from 'react-native-svg'

const MenuDropDown = ({
    archon,
    archonContainerStyle,
    options= [],
} : {
    archon: React.JSX.Element,
    archonContainerStyle?: StyleProp<ViewStyle>
    options?: {
        id: string;
        Icon: React.FC<SvgProps>
        title?: string;
        onPress?(): void;
        backgroundColor?: string;
        iconColor?: string 
    }[];
}) => {
    const menuRef = React.useRef<MenuTriggerRef>(null);
    return(
    <MenuTrigger
    ref = {menuRef}
    archonContainerStyle = { archonContainerStyle}
    modalContainerStyle = {{}}
    archon = {archon}>
        <View style= {styles.container}>
            {options.map(
                ({Icon, title, onPress, iconColor, id, backgroundColor}) => {
                    return (
                        <TouchableOpacity
                        key = {id}
                        style = {[
                            styles.optionItem,
                            {
                                backgroundColor: backgroundColor,
                            },
                        ]}
                        onPress = {() => {
                            menuRef.current?.closeMenu();
                            if(onPress) {
                                onPress();
                            }
                        }}>
                            <Icon
                                width = {20}
                                height = {20}
                                color={iconColor || '#212121'}
                            />
                            <BaseText
                            typography = {Typography.bodyMedium.large}
                            ml={12}
                            color={'#212121'}
                            >
                                {title}
                            </BaseText>
                        </TouchableOpacity>
                    );
                },
            )}
        </View>
    </MenuTrigger>
)}

const styles = StyleSheet.create({
    container: { 
        paddingVertical: 10,
        borderRadius : 16,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 4,
    },
    optionItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: dimensions.scale(192),
        borderRadius: 4,
    }
})
export default MenuDropDown