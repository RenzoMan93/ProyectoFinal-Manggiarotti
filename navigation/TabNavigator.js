import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import MyProceduresScreen from '../screens/MyProceduresScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS, FONTS } from '../lib/theme';

const Tab = createBottomTabNavigator();

function TabDot({ focused, color }) {
  return (
    <View
      style={{
        width: 5,
        height: 5,
        borderRadius: 999,
        backgroundColor: focused ? color : 'transparent',
      }}
    />
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.stamp,
        tabBarInactiveTintColor: COLORS.inkSoft,
        tabBarStyle: {
          backgroundColor: COLORS.paperRaised,
          borderTopColor: COLORS.line,
        },
        tabBarLabelStyle: { fontFamily: FONTS.mono, fontSize: 10 },
        tabBarIcon: ({ focused, color }) => <TabDot focused={focused} color={color} />,
      }}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Buscar" component={SearchScreen} />
      <Tab.Screen name="MisTramites" component={MyProceduresScreen} options={{ title: 'Mis trámites' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
