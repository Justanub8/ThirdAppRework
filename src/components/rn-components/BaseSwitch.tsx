import * as React from 'react'
import {StyleSheet, Switch, SwitchProps } from 'react-native'

interface BaseSwitchProps extends SwitchProps{
    value?: boolean | undefined;
    onValueChange?: ((value: boolean) => void |Promise<void> ) | null | undefined
}
const BaseSwitch = (props : BaseSwitchProps) => {
    const [actived, setActived] = React.useState(!!props.value);
    return (
        <Switch
            trackColor={{
                false: '#eeeeee',
                true: '#246BFD',
            }}  
            thumbColor = {'#FFFFFF'}
            ios_backgroundColor = {'#FFFFFF'}
            onValueChange = {value => {
                if(props.onValueChange){
                    props.onValueChange(value);
                }
                setActived(value);
            }}
            value = {actived}
            style = {styles.Switch}
            {...props}
        />
    );
};
export default BaseSwitch;

const styles = StyleSheet.create({
    Switch: {
        transform: [{scale: 0.8}],
    },
});