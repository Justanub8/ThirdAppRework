import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { BaseText, FastImage } from '../rn-components'
import { images } from '~/assets/images'
import { commonStyles } from '~/constants'
const Story = (
    {
        username, 
        imageURL,
    } : {
        username: string,
        imageURL?: string,
    }

) => {
  return (
    <View
        style = {{borderWidth: 1, borderColor: '#000000' , width: 100}}
    >
      <LinearGradient
        style = {styles.avatarContainer}
        colors = {["#FFDC80", "#FCAF45", "#F77737", "#F56040", "#ff022e", "#E1306C", "#e300c8", "#833AB4"]}
        start={{ x: 0.0, y: 1.0 }}
        end={{ x: 1.0, y: 0.0 }}
      >
      <View 
        style={{ borderRadius: 9999, width:90, height: 90, borderWidth: 2, borderColor: '#ffffff', backgroundColor: '#ffffff'}}
      >
        <FastImage
            source={images.avater_random}
            resizeMode='cover'
            style={{width: '100%', height: '100%', borderRadius: 9999}}
        />
      </View>
      </LinearGradient>
      <BaseText style={commonStyles.alignSelfCenter} numberOfLines={1}>
        {username}
      </BaseText>
    </View>
  )
}
const styles = StyleSheet.create({
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 9999,
        justifyContent: 'center',
        alignItems: 'center'
    },
})

export default Story