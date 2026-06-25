import { TouchableNativeFeedback, View, Text } from "react-native";

const ItemDropdown = ({ item, isSelected, onSelect }) => {
    const backgroundColor = isSelected ? '#00ffff40' : 'transparent';
    const focusRipple = !isSelected ? TouchableNativeFeedback.Ripple('rgba(255, 215, 0, 0.75)', false) : undefined;

    return (
        <View style={{ height: 50, backgroundColor }}>
            <TouchableNativeFeedback
                onPress={() => onSelect(item)}
                background={focusRipple}
                useForeground={false}
                hasTVPreferredFocus={isSelected}
            >
                <View style={{ padding: 15 }}>
                    <Text style={{ fontSize: 18, color: '#000' }}>
                        {item.name}
                    </Text>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};

export default ItemDropdown;