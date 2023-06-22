import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {colors} from './src/constants';
import Game from './src/components/Game';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WORDLE</Text>
      <Game />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: colors.lightgrey,
    letterSpacing: 7,
  },
});

export default App;
