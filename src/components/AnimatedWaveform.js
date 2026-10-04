import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const BAR_COUNT = 24;

const WaveBar = ({ isPlaying, index }) => {
  const animValue = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    let animation;
    if (isPlaying) {
      const minHeight = 8;
      const maxHeight = 40 + ((index * 7) % 55);
      const duration = 280 + ((index * 93) % 420);

      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: maxHeight,
            duration: duration,
            useNativeDriver: false,
          }),
          Animated.timing(animValue, {
            toValue: minHeight,
            duration: duration,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
    } else {
      Animated.timing(animValue, {
        toValue: 8,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    return () => animation?.stop();
  }, [isPlaying]);

  return <Animated.View style={[styles.bar, { height: animValue }]} />;
};

export default function AnimatedWaveform({ isPlaying = true }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: BAR_COUNT }).map((_, idx) => (
        <WaveBar key={idx} index={idx} isPlaying={isPlaying} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    gap: 4,
    width: '100%',
  },
  bar: {
    width: 3.5,
    backgroundColor: '#00FF66',
    borderRadius: 3,
    shadowColor: '#00FF66',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});