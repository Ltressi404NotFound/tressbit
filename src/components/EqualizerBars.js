import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const BAR_COUNT = 16;

export default function EqualizerBars({ isPlaying = true, primaryColor = '#00FFA3', secondaryColor = '#8A2BE2' }) {
  const animatedValues = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    if (!isPlaying) return;

    const animations = animatedValues.map((anim, index) => {
      const randomDuration = 350 + (index % 5) * 120;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.min(1, 0.35 + Math.random() * 0.65),
            duration: randomDuration,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.15 + Math.random() * 0.25,
            duration: randomDuration * 0.9,
            useNativeDriver: false,
          }),
        ])
      );
    });

    animations.forEach((anim) => anim.start());

    return () => animations.forEach((anim) => anim.stop());
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      {animatedValues.map((anim, index) => {
        // Dégradé alterné entre vert électrique et violet
        const barColor = index % 2 === 0 ? primaryColor : secondaryColor;
        const heightPercent = anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['10%', '100%'],
        });

        return (
          <View key={index} style={styles.barWrapper}>
            <Animated.View
              style={[
                styles.bar,
                {
                  height: heightPercent,
                  backgroundColor: barColor,
                  shadowColor: barColor,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 70,
    width: '100%',
    paddingHorizontal: 20,
    gap: 5,
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 4,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});