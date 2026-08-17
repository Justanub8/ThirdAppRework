import { View, Text } from 'react-native'
import React, { useState} from 'react'
import CustomHeader from '~/components/CustomeHeader'
import { LeftArrow, RightArrow } from '~/assets/svgs'
import { PrimaryInput } from '~/components/inputs'
import { BaseText } from '~/components/rn-components'
import { commonStyles, Typography } from '~/constants'
import { Navigation } from '~/utils'

const NewMessage = () => {
    const [searchContact, setSearchContact] = useState('');
    const handleSearch = async () => {
        try{

        }catch (error){

        }
    }
  return (
    <>
        <CustomHeader
            title='Tin nhắn mới'
            LeftComponent={<LeftArrow height={24} width={24} onPress={() => Navigation.pop()}/>}
        />
        <View style={[commonStyles.paddingHorizontal16, commonStyles.container]}>
            <View style={[ commonStyles.flexRow, commonStyles.alignItemsCenter]}>
                <BaseText typography={Typography.bodyMedium.large}>Đến:</BaseText>
                <View style={[commonStyles.flex]}> 
                    <PrimaryInput
                        style={commonStyles.flexGrow}
                        placeholder='Tìm kiếm'
                    />
                </View>
            </View>
            <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.justifyBetween]}>
                <View style={[commonStyles.flexRow, commonStyles.gap16, commonStyles.alignItemsCenter]}>
                    <LeftArrow width={24} height={24}/>
                    <BaseText>Nhóm chat</BaseText>
                </View>
                <RightArrow height={24} width={24}/>
            </View>
            <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.justifyBetween]}>
                <View style={[commonStyles.flexRow, commonStyles.gap16, commonStyles.alignItemsCenter]}>
                    <LeftArrow width={24} height={24}/>
                    <BaseText>Đoạn chat với AI</BaseText>
                </View>
                <RightArrow height={24} width={24}/>
            </View>
            <BaseText>Gợi ý</BaseText>
        </View>
    </>
  )
}

export default NewMessage