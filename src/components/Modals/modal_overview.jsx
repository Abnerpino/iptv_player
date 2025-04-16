import { Modal, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

const ModalOverview = ({ openModal, handleCloseModal, overview }) => {
    
    return(
        <Modal transparent visible={openModal} onRequestClose={handleCloseModal} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row' }}>
                            <Icon name="info-circle" size={27} color="#333"/>
                            <Text style={styles.textHeader}>TRAMA</Text>
                        </View>
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Icon name="window-close" size={27} color="red"/>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingHorizontal: 20, paddingVertical: 10, maxHeight: '88%', }}>
                        <Text style={styles.text}>{overview}</Text>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        width: "70%",
        maxHeight: '80%'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingVertical: 5,
        paddingHorizontal: 20,
    },
    textHeader: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
    text: {
        fontSize: 18,
        color: "#333",
        textAlign: 'justify',
    },
});

export default ModalOverview;