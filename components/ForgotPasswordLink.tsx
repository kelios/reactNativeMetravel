import React from "react";
import {Text, TouchableOpacity} from 'react-native';

const ForgotPasswordLink = ({onPress}) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Text style={{color: '#0066ff', textDecorationLine: 'underline'}}>Забыли пароль?</Text>
        </TouchableOpacity>
    );
};