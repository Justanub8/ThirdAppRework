import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PrimaryInput } from '~/components/inputs'
import { SearchLightIcon } from '~/assets/svgs'
import { commonStyles } from '~/constants'

const Explore = () => {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[commonStyles.container, commonStyles.paddingScrollHorizontal]}>
      <PrimaryInput
        placeholder='Tìm kiếm'
        LeftComponent={SearchLightIcon}
      />
    </SafeAreaView>
  )
}

export default Explore