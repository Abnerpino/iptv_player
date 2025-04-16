import { View, Text, TouchableHighlight } from "react-native";

const ItemCategory = ({ categoria, seleccionado, seleccionar }) => {
    const backgroundColor = categoria.id === seleccionado ? '#006172' : 'rgba(16,16,16,0)'; // Cambia el color según la selección

    const handleSelectionCategory = () => {
        seleccionar(categoria.id);
    };

    return (
        <TouchableHighlight
            style={[{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#303030', }, { backgroundColor }]}
            onPress={handleSelectionCategory}
            underlayColor={(categoria.id !== seleccionado) ? "#D5700F" : "#006172"}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                <Text style={{ color: '#FFF', fontSize: 14, }}>{categoria.name}</Text>
                <Text style={{ color: '#FFF', fontSize: 14, }}>{categoria.total}</Text>
            </View>
        </TouchableHighlight>
    );
}

export default ItemCategory;