import React, {useState, useEffect} from 'react';
import {Text, View, ScrollView, Alert} from 'react-native';
import {colors, CLEAR, ENTER, colorsToEmoji} from '../../constants';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  SlideInLeft,
  ZoomIn,
  FlipInEasyY,
} from 'react-native-reanimated';

// components
import Keyboard from '../Keyboard';
import EndScreen from '../EndScreen';

import styles from './Game.styles';
import {copyArray, dayOfTheYear, getDayKey} from '../utils';

const dayKey = getDayKey();

const Game = () => {
  // AsyncStorage.removeItem('@game');
  const word = 'hello';
  const letters = word.split('');
  const NO_OF_TRIES = 6;
  const [rows, setRow] = useState(
    new Array(NO_OF_TRIES).fill(new Array(letters.length).fill('')),
  );

  const [currRow, setCurrRow] = useState(0);
  const [currCol, setCurrCol] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (currRow > 0) {
      checkGameState();
    }
  }, [currRow]);

  useEffect(() => {
    if (isLoaded) {
      persistState();
    }
  }, [rows, currRow, currCol, gameState]);

  useEffect(() => {
    readState();
  }, []);

  const persistState = async () => {
    const dataOftheDay = {rows, currRow, currCol, gameState};
    try {
      const existingDataString = await AsyncStorage.getItem('@game');
      const existingData = existingDataString
        ? JSON.parse(existingDataString)
        : {};

      existingData[dayKey] = dataOftheDay;
      const dataString = JSON.stringify(existingData);

      await AsyncStorage.setItem('@game', dataString);
    } catch (e) {
      console.log('An error ocurred during persisting of data ', e);
    }
  };

  const readState = async () => {
    try {
      const dataString = await AsyncStorage.getItem('@game');

      const data = JSON.parse(dataString);
      const day = data[dayKey];

      setRow(day.rows);
      setCurrRow(day.currRow);
      setCurrCol(day.currCol);
      setGameState(day.gameState);
    } catch (e) {
      console.log('An error ocurred during reading of state', e);
    }
    setIsLoaded(true);
  };

  const checkGameState = () => {
    if (checkIfWon() && gameState != 'won') {
      // Alert.alert('Hurray!!', 'You won', [
      //   {text: 'Share', onPress: shareScore},
      // ]);
      setGameState('won');
    } else if (checkIfLose() && gameState != 'lost') {
      // Alert.alert('Nehh!', 'Try again tomorrow');
      setGameState('lost');
    }
  };

  const checkIfWon = () => {
    const row = rows[currRow - 1];
    return row.every((letter, i) => letter == letters[i]);
  };
  const checkIfLose = () => {
    return !checkIfWon() && currRow == rows.length;
  };

  const onKeyPressed = key => {
    const updatedRows = copyArray(rows);

    if (gameState != 'playing') {
      return;
    }

    if (key == CLEAR) {
      if (currCol > 0) {
        const prevCol = currCol - 1;
        updatedRows[currRow][prevCol] = '';
        setRow(updatedRows);
        setCurrCol(prevCol);
      }
      return;
    }

    if (key == ENTER) {
      if (currCol == rows[0].length) {
        setCurrRow(currRow + 1);
        setCurrCol(0);
      }
      return;
    }

    if (currCol < rows[0].length) {
      updatedRows[currRow][currCol] = key;
      setRow(updatedRows);
      setCurrCol(currCol + 1);
    }
  };

  const isActiveCell = (row, col) => {
    return row == currRow && col == currCol;
  };

  const getCellStyle = (indexRow, indexCol) => [
    styles.cell,
    {
      borderColor: isActiveCell(indexRow, indexCol)
        ? colors.grey
        : colors.darkgrey,
      backgroundColor: getCellBGColor(indexRow, indexCol),
    },
  ];

  const getCellBGColor = (row, col) => {
    const letter = rows[row][col];

    if (row >= currRow) {
      return colors.black;
    }

    if (letter == letters[col]) {
      return colors.primary;
    }

    if (letters.includes(letter)) {
      return colors.secondary;
    }

    return colors.darkgrey;
  };

  const setAllLettersWithColor = color =>
    rows.flatMap((row, i) =>
      row.filter((cell, j) => getCellBGColor(i, j) == color),
    );

  const greenCaps = setAllLettersWithColor(colors.primary);
  const yellowCaps = setAllLettersWithColor(colors.secondary);
  const greyCaps = setAllLettersWithColor(colors.darkgrey);

  if (gameState != 'playing') {
    return (
      <EndScreen
        won={gameState == 'won'}
        rows={rows}
        getCellBGColor={getCellBGColor}
      />
    );
  }

  return (
    <>
      <ScrollView style={styles.map}>
        {rows.map((row, indexRow) => (
          <Animated.View
            entering={SlideInLeft.delay(indexRow * 30)}
            style={styles.row}
            key={`${indexRow}-row`}>
            {row.map((letter, indexCol) => (
              <React.Fragment key={`cell-${indexCol}-row-${indexRow}`}>
                {indexRow < currRow && (
                  <Animated.View
                    entering={FlipInEasyY.delay(indexCol * 100)}
                    style={getCellStyle(indexRow, indexCol)}
                    key={`${indexCol}-enter-col-${indexRow}-row`}>
                    <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                  </Animated.View>
                )}

                {indexRow == currRow && !!letter && (
                  <Animated.View
                    entering={ZoomIn}
                    style={getCellStyle(indexRow, indexCol)}
                    key={`${indexCol}-active-col-${indexRow}-row`}>
                    <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                  </Animated.View>
                )}

                {!letter && (
                  <View
                    style={getCellStyle(indexRow, indexCol)}
                    key={`${indexCol}-col-${indexRow}-row`}>
                    <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                  </View>
                )}
              </React.Fragment>
            ))}
          </Animated.View>
        ))}
      </ScrollView>
      <Keyboard
        onKeyPressed={onKeyPressed}
        greenCaps={greenCaps}
        yellowCaps={yellowCaps}
        greyCaps={greyCaps}
      />
    </>
  );
};

export default Game;
