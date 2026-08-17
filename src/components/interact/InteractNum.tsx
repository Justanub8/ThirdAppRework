import { BaseText } from '../rn-components'
import { commonStyles, Typography } from '~/constants'
import * as React from 'react'
import { TouchableOpacity, View, } from 'react-native'
import millify from 'millify'
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
    <View style = {[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.gap4]}>
        {onPress ? (
            <TouchableOpacity onPress={onPress}>
                {accessory ? accessory : null}
            </TouchableOpacity>
        ) : (
            <View>
                {accessory ? accessory : null}
            </View>
        )}
        <BaseText typography = {Typography.bodyBold.small}>
            {interactNum? millify(interactNum, {precision: 2}) : ''}
        </BaseText>
    </View>
  )
}

export default InteractNum