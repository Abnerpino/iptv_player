import React, { forwardRef } from 'react';
import { View, TouchableNativeFeedback, Platform } from "react-native";

const RippleButton = forwardRef(({ mainStyle, secondaryStyle, iconLib: Icon, name, size, color, onPress, onLongPress, disabled, hasTVPreferredFocus, rippleColor, ...props }, ref) => {
    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', true) : TouchableNativeFeedback.Ripple(rippleColor ?? '#FFFFFF80', true);
    
    return (
        <View style={[mainStyle]}>
            <TouchableNativeFeedback
                ref={ref}
                onPress={onPress}
                onLongPress={onLongPress}
                disabled={disabled}
                background={focusRipple}
                useForeground={false}
                hasTVPreferredFocus={hasTVPreferredFocus}
                {...props}
            >
                <View style={[secondaryStyle]}>
                    <Icon name={name} size={size || 26} color={color || "white"} />
                </View>
            </TouchableNativeFeedback>
        </View>
    );
});

export default RippleButton;