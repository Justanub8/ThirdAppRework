import { View, StyleSheet } from 'react-native';
import React from 'react';
import { Avatar } from '../avatar';
import { useTheme, Theme } from '~/hooks';

const Note = () => {
    const { theme } = useTheme() 
    const styles = React.useMemo(() => getStyles(theme), [theme])
  return (
    <View style={styles.container}>
        <View style={styles.noteContainer}>
            <Avatar size={80} username="SomeName" />
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
    noteContainer: {
        height: 120,
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});

export default Note;