import { BaseText } from '../rn-components';
import { Typography } from '~/constants';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import millify from 'millify';

const InteractNum = ({
    interactNum,
    accessory,
    onPress,
} : {
    interactNum?: number,
    accessory: React.JSX.Element,
    onPress?: () => void
}) => {
  return (
    <View style={styles.container}>
        {onPress ? (
            <TouchableOpacity onPress={onPress}>
                {accessory ? accessory : null}
            </TouchableOpacity>
        ) : (
            <View>
                {accessory ? accessory : null}
            </View>
        )}
        <BaseText typography={Typography.bodyBold.small}>
            {interactNum ? millify(interactNum, { precision: 2 }) : ''}
        </BaseText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default InteractNum;