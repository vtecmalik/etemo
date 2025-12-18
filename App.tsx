import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <MainNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
