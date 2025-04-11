import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ModalExit = ({ visible, onConfirm, onCancel }) => (
    <Modal transparent visible={visible} onRequestClose={onCancel} animationType="fade">
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>¿Realmente deseas salir?</Text>
                </View>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity onPress={onConfirm} style={[styles.button, { backgroundColor: 'red' }]}>
                        <Text style={styles.text}>Sí</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onCancel} style={[styles.button, { backgroundColor: 'green' }]}>
                        <Text style={styles.text}>No</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

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
        width: "40%",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingVertical: 5,
        paddingHorizontal: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    button: {
        borderRadius: 5,
        padding: 5,
        marginVertical: 10,
        width: '15%',
    },
    text: {
        fontSize: 18,
        color: "#FFF",
        textAlign: 'center',
    },
});

export default ModalExit;
