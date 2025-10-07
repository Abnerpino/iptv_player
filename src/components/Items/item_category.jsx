import { View, Text, TouchableHighlight } from "react-native";

const ItemCategory = ({ categoria, propContent, seleccionado, seleccionar }) => {
    const backgroundColor = categoria.category_id === seleccionado ? '#006172' : 'rgba(16,16,16,0)'; // Cambia el color según la selección

    const handleSelectionCategory = () => {
        seleccionar(categoria);
    };

    return (
        <TouchableHighlight
            style={[{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#303030', }, { backgroundColor }]}
            onPress={handleSelectionCategory}
            underlayColor={(categoria.category_id !== seleccionado) ? "#D5700F" : "#006172"}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                <Text style={{ width: '75%', color: '#FFF', fontSize: 14, }} numberOfLines={1}>{categoria.category_name}</Text>
                <Text style={{ width: '25%',color: '#FFF',  fontSize: 14, textAlign: 'right', }}>{categoria.total}</Text>
            </View>
        </TouchableHighlight>
    );
}

export default ItemCategory;