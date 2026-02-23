// Logic for Signup and Login Page

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignupScreen from "../Screens/Auth/SignupScreen";
import LoginScreen from "../Screens/Auth/LoginScreen";

const Stack = createNativeStackNavigator();

const AuthStack = ()=> {
    return (
        <Stack.Navigator>
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
        </Stack.Navigator>
    )
}

export default AuthStack;

