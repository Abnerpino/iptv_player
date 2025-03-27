import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CardMultimedia from '../../components/Cards/card_multimedia';
import M3UController from '../../services/controllers/m3uController';

const m3uController = new M3UController;

const Menu = ({ navigation, route }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState({ categories: [], content: [] }); // Estado para manejar la información de todo el contenido y todas las categorias
    
    useEffect(() => {
        let isMounted = true; // Para evitar actualizar estado si el componente se desmonta

        m3uController.handleGetDataByType()
            .then(([categories, content]) => {
                if (isMounted) {
                    setData({ categories, content });
                }
            })
            .catch(error => console.log("Error al obtener datos:", error));

        return () => { isMounted = false }; // Cleanup para evitar fugas de memoria
    }, []); // Se ejecuta solo cuando se monta el componente

    useEffect(() => {
        // Función para actualizar la fecha y hora
        const updateDate = () => {
            setCurrentDate(new Date());
        };

        // Establece un intervalo para verificar cada segundo
        const intervalId = setInterval(() => {
            const now = new Date();
            // Solo actualiza si el segundo es 0 (es decir, al inicio de cada minuto)
            if (now.getSeconds() === 0) {
                updateDate();
            }
        }, 1000); // Verifica cada segundo

        // Limpia el intervalo al desmontar el componente
        return () => clearInterval(intervalId);
    }, []);
    
    const getMultimediaByType = (type) => {
        let cats = [];
        let cont = [];

        if (type === 'TV') {
            cats = data.categories[0];
            cont = data.content[0];
        } else if (type === 'Cine') {
            cats = data.categories[1];
            cont = data.content[1];
        } else {
            cats = data.categories[2];
            cont = data.content[2];
        }

        return {categories: cats, content: cont}
    };

    const optionsDate = {
        year: 'numeric',
        month: 'long', // '2-digit' para mes numérico
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // Para formato de 12 horas
        timeZone: 'America/Mexico_City', // Establece la zona horaria
    };

    const formattedDate = currentDate.toLocaleString('es-MX', optionsDate);

    const tiposMultimedia = [
        { tipo: 'TV', fondo: '#3D41E9' },
        { tipo: 'Cine', fondo: '#DD3652' },
        { tipo: 'Series', fondo: '#9743B5' }
    ];

    return (
        <View style={styles.container}>
            {/* Header con logo y fecha */}
            <View style={styles.header}>
                <Text style={styles.logo}>IPTV PLAYER</Text>
                <Text style={styles.date}>{formattedDate}</Text>
            </View>

            {/* Fila 1: TV en Directo, Cine, Series */}
            <View style={styles.row}>
                {tiposMultimedia.map((multimedia, idx) => (
                    <CardMultimedia
                        key={idx}
                        navigation={navigation}
                        tipo={multimedia.tipo}
                        fondo={multimedia.fondo}
                        data={getMultimediaByType(multimedia.tipo)}
                    />
                ))}
            </View>

            {/* Footer con fecha de expiración */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>EXPIRACIÓN: octubre 4, 2024</Text>
                <Text style={styles.footerText}>Conectado: TV</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#141829',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    date: {
        color: '#fff',
        fontSize: 14,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        height: '70%'
    },
    footer: {
        marginTop: 'auto',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    footerText: {
        color: '#fff',
        fontSize: 14,
    },
});

export default Menu;
