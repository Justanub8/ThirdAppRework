import { View, StyleSheet } from 'react-native';
import React from 'react';
import { BaseText, FastImage } from '../rn-components';
import { images } from '~/assets/images';
import { useTheme, Theme } from '~/hooks';

const Note = () => {
    const { theme } = useTheme() 
    const styles = React.useMemo(() => getStyles(theme), [theme])
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

const getStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        borderWidth: 1,
    },
    avatar: {
        height: 100,
        width: 100,
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