import { View, StyleSheet } from 'react-native';
import React from 'react';
import { BaseText, FastImage } from '../rn-components';
import { images } from '~/assets/images';

const Note = () => {
  return (
    <View style={styles.container}>
        <View style={styles.noteContainer}>
            <FastImage source={images.avater_random} style={styles.avatar}/>
            <BaseText>
                SomeName
            </BaseText>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#000000',
    },
    avatar: {
        height: 100,
        width: 100,
        borderColor: '#000000',
        borderRadius: 99999,
        borderWidth: 1,
    },
    noteContainer: {
        height: 120,
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});

export default Note;