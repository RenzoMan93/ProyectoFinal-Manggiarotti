import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ProcedureDetailScreen from '../screens/ProcedureDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="ProcedureDetail"
        component={ProcedureDetailScreen}
        options={{ title: 'Trámite' }}
      />
    </Stack.Navigator>
  );
}
