import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';

interface MultiProgressBarProps {
  total: number;       
  activeIndex: number; 
  progress: number;    
}

export const MultiProgressBar: React.FC<MultiProgressBarProps> = ({
  total,
  activeIndex,
  progress,
}) => {
  if (total <= 0) return null;

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        let fillWidth: DimensionValue = '0%';
        if (index < activeIndex) {
          fillWidth = '100%';
        } else if (index === activeIndex) {
          fillWidth = `${Math.min(Math.max(progress * 100, 0), 100)}%`;
        }

        return (
          <View key={index} style={styles.track}>
            <View style={[styles.fill, { width: fillWidth }]} />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 8,
    gap: 4,              
    position: 'absolute',
    top: 8,
    zIndex: 10,
  },
  track: {
    flex: 1,             
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)', 
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#FFFFFF', 
  },
});