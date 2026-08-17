import { dimensions } from "@helpers/index"
import _ from 'lodash'
import * as React from 'react'
import {
    Modal,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native'
import { Gesture, GestureDetector, } from "react-native-gesture-handler"
import { runOnJS } from "react-native-worklets"
import { commonStyles } from "@themes/commonStyles"
import { create } from "zustand"

interface MenuTriggerProps {
    children: React.JSX.Element;
    archon: React.JSX.Element;
    archonContainerStyle?: StyleProp<ViewStyle>
    modalContainerStyle?: StyleProp<ViewStyle>
}
export interface MenuTriggerRef {
    closeMenu: () => void;
}
const PADDING_HORIZONTAL = 24;
type MenuTriggerType = {
    visible: boolean;
    layout: {x:number; y: number}
    childrenLayout: {width: number, height: number}
    archonLayout: { width: number, height: number}
    setVisible(visible: boolean): void;
    setLayout(layout: {x: number ;y: number}): void;
    setArchonLayout(archonLayout: {width: number; height: number}): void;
    setChildrenLayout(childrenLayout: {width: number; height: number}) : void
}
export const useMenuTrigger = create<MenuTriggerType>(set => ({
    visible: false,
    layout: {x: -dimensions.widthScreen, y: -dimensions.heightScreen},
    childrenLayout: {width: 0 , height: 0},
    archonLayout: {width: 0, height: 0},
    setLayout(layout){
        set({layout});
    },
    setArchonLayout(archonLayout){
        set({archonLayout});
    },
    setChildrenLayout(childrenLayout){
        set({childrenLayout});
    },
    setVisible(visible){
        set({visible});
    },
}))

const MenuTrigger = React.forwardRef<MenuTriggerRef, MenuTriggerProps>(
    ({children, archon, archonContainerStyle, modalContainerStyle}, ref) => {
        const [visible, setVisible] = React.useState(false)
        const [layout, setLayout] = React.useState<{x:number ; y: number}>({
            x: -dimensions.widthScreen,
            y: -dimensions.heightScreen,
        });
        const childrenLayout = React.useRef({width: 0, height: 0});
        const archonLayout = React.useRef({width: 0, height: 0});
        const openMenu = ({x,y}: {x: number; y: number}) => {
            setLayout({x,y})
            setVisible(true);
        }
        const closeMenu = () => {
            setVisible(false)
        }
        React.useImperativeHandle(ref, () =>({
            closeMenu: () => {
                closeMenu();
            },
        }))
        const gesture = React.useMemo(
            () => 
                Gesture.Tap().onStart(event => {
                    runOnJS(openMenu)({
                        x:event.absoluteX - event.x,
                        y:event.absoluteY - event.y,
                    });
                }),
            [],
        );

        const modalStyle = React.useMemo(() => {
            const archonX1 = layout.x;
            const archonX2 = layout.x + archonLayout.current.width;
            const archonY1 = layout.y;
            const archonY2 = layout.y + archonLayout.current.height;
            const spaceRight = dimensions.widthScreen - archonX2;
            const spaceLeft = archonX1;
            const spaceTop = archonY1;
            const spaceBottom = dimensions.heightScreen - archonY2;

            const containerStyle: StyleProp<ViewStyle> = {};
            if (spaceLeft < spaceRight){
                containerStyle.left = 
                    archonX1 > PADDING_HORIZONTAL ? archonX1 : PADDING_HORIZONTAL
            } else {
                containerStyle.right =
                    spaceRight > PADDING_HORIZONTAL ? spaceRight : PADDING_HORIZONTAL
            }

            if (spaceTop > spaceBottom) {
                containerStyle.bottom =
                spaceBottom + archonLayout.current.height > PADDING_HORIZONTAL
                    ? spaceBottom + archonLayout.current.height
                    : PADDING_HORIZONTAL;
            } else {
                containerStyle.top =
                archonY2 > PADDING_HORIZONTAL ? archonY2 : PADDING_HORIZONTAL;
            }
            return StyleSheet.create({
                container: containerStyle,
            });
        }, [layout, archonLayout]);
        return (
            <>
            <GestureDetector gesture = {gesture}>
                <TouchableOpacity
                onLayout={event => {
                    const width = _.get(event, 'nativeEvent.layout.width', 0)
                    const height = _.get(event, 'nativeEvent.layout.height', 0)
                }}
                style = {archonContainerStyle}
                >
                    {archon}
                </TouchableOpacity>
            </GestureDetector>
            <Modal visible = {visible} transparent = { true}>
                <View style = {styles.overlayStyle}>
                    <TouchableOpacity
                    activeOpacity={1}
                    style={StyleSheet.absoluteFill}
                    onPress={closeMenu}
                    >
                        {visible ? (
                            <View
                            onLayout={event => {
                                const width = _.get(event, 'nativeEvent.layout.width' , 0);
                                const height = _.get(event, 'nativeEvent.layout.height', 0);
                                childrenLayout.current = { width, height}
                            }}
                            style = {[
                                modalStyle.container,
                                styles.childrenContainer,
                                modalContainerStyle
                            ]}
                            >
                            {children}
                        </View>
                        ) : null}              
                    </TouchableOpacity>
                </View>
            </Modal>
            </>
        )
    }
)
const styles = StyleSheet.create({
    childrenContainer: {
        position: 'absolute',
        ...commonStyles.shadow
    },
    overlayStyle: {
        flex: 1,
        backgroundColor: 'rgba(9, 16, 29, 0.8)'
    }
})

export default MenuTrigger
