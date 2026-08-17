import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PrimaryInput } from '~/components/inputs'
import { SearchLightIcon } from '~/assets/svgs'

const Explore = () => {
  return (
    <SafeAreaView>
      <PrimaryInput
        placeholder='Tìm kiếm'
        LeftComponent={SearchLightIcon}
      />
    </SafeAreaView>
  )
}

export default Explore