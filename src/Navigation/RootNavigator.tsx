import { NavigationContainer } from "@react-navigation/native";
import { useState } from "react";
import BottomTabNav from "./BottomTabNav";
import AuthStack from "./AuthStack";

const RootNavigator = ()=> {
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    return (
        <NavigationContainer>
            {isLoggedIn ? <BottomTabNav /> : <AuthStack />}
        </NavigationContainer>
    )
}

export default RootNavigator;