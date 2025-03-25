import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CardMultimedia from '../../components/Cards/card_multimedia';
import M3UController from '../../services/controllers/m3uController';
import TMDBController from '../../services/controllers/tmdbController';
import Categorias from '../../services/models/categorias';
import Contenido from '../../services/models/contenido';

const Menu = ({ navigation, route }) => {
    //Instancia del controlador que maneja la lista M3U
    const m3uController = new M3UController();
    const tmdbController = new TMDBController;
    const categorias = new Categorias();
    const contenido = new Contenido();

    //const tv = route.params.tv;
    //const cine = route.params.cine;
    //const series = route.params.series;

    const [multimediaData, setMultimediaData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

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

    const getInfoSerie = async (series) => {
        const content = [];
        for (const serie of series) {
            const title = separateTitle(serie['tvg-name']);
            const still = getStillPath(serie['tvg-logo']);
            const info = await tmdbController.findSerie(title.name, title.year, title.season, title.episode, still);
            //console.log(info.name);
            content.push({
                //id: info.id,
                'tvg-name': `${title.name} (${title.year})`, //info.name,
                'tvg-logo': info.poster_path,
                'group-title': serie['group-title'],
                link: serie.link
            });
        }
        //setMultimediaData(content);
        //console.log("Contenido:");
        //console.log(content);
        return content;
    };

    const handleGetDataByType = (tipoMultimedia) => {
        let categories = [];
        let content = [];

        if (tipoMultimedia === 'TV') {
            categories = categorias.tv;
            content = contenido.tv;
        } else if (tipoMultimedia === 'Cine') {
            categories = categorias.cine;
            content = contenido.cine;
        } else {
            categories = categorias.series;
            //content = series;
            //content = await getInfoSerie(contenido.series);
//console.log(content);
            content = contenido.series;
        }
        //console.log(categorias);
        //const canales = m3uController.parseM3U();

        //setChannels(canales);
        //console.log(canales);
        //console.log(content);
        categories.forEach(categoria => { //Para cada categoria...
            //console.log(categoria);
            let cont = 0; //Variable para contar la cantidad de elementos en cada categoria
            if (categoria.name !== 'TODO') { //Si la categoria es cualquier otra que no sea TODO
                content.forEach(contenido => { //Para cada elemento de contenido (item)...
                    //Si el nombre de la categoria es igual al titulo de grupo de cada elemento de contenido, se autoincrementa cont
                    if (categoria.name === contenido['group-title']) {
                        //console.log(categoria.name);
                        cont++;
                    }
                });
            } else {
                cont = content.length; //Obtiene directamente el numero de elementos de contenido si la categoria es TODO
            }
            categoria.count = cont; //Actualiza la cantidad de elementos de la categoria
        });
        //console.log(categories);
        //console.log(content);

        return [categories, content]; //Retorna un arreglo que contiene las categorias de la Multimedia seleccionada y su contenido
    };

    /*useEffect(() => {
        getInfoSerie(contenido.series); // Llama a la función para obtener datos al montar el componente
    }, [tiposMultimedia]);*/ // Dependencia para volver a cargar si tiposMultimedia cambia

    function separateTitle(titulo) {
        //const title = titulo.replace(/ S\d+E\d+$/, ''); // Elimina la informacion de temporada y episodio si es Serie
        //return title; // Retorna solo el titulo

        const regex = /(.*?)\s\((\d{4})\)\sS(\d+)\sE(\d+)/;
        const match = titulo.match(regex);

        return { // Retorna por separado la información
            name: match[1],   // Nombre de la serie
            year: match[2],   // Año de estreno
            season: match[3], // Número de temporada
            episode: match[4] // Número de episodio
        };
    }

    function getStillPath(path) {
        const ultimoSlash = path.lastIndexOf('/'); // Encuentra la última posición de '/'
        return path.substring(ultimoSlash); // Extrae desde esa posición hasta el final
    }

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
                        data={handleGetDataByType(multimedia.tipo)}
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
