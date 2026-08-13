import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ProcedureDetailScreen from '../screens/ProcedureDetailScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import AuthScreen from '../screens/AuthScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ProcedureDetail" component={ProcedureDetailScreen} />
      <Stack.Screen name="Checklist" component={ChecklistScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
