import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCatsLive, setCatsVod, setCatsSeries, setLive, setVod, setSeries, changeCategoryProperties } from '../redux/slices/streamingSlice';

export const useXtream = () => {
    const dispatch = useDispatch();
    const { user, password, host } = useSelector(state => state.client);
    const { live, vod, series } = useSelector(state => state.streaming);
    const url = `${host}/player_api.php?username=${user}&password=${password}`;

    const getInfoAccount = async () => {
        try {
            const response = await fetch(url);
            const info = await response.json();
            console.log(info.user_info.status);
        } catch (error) {
            console.log('Error en la petición: ', error);
        }
    };

    const getFullStreaming = async () => {
        /*AsyncStorage.clear().then(() => {
            console.log('✅ AsyncStorage limpiado con éxito');
        });*/

        const tipos = ['live', 'vod', 'series'];
        const initialCats = [
            { category_id: '0.1', category_name: 'TODO', total: 0 },
            { category_id: '0.2', category_name: 'RECIENTEMENTE VISTO', total: 0 },
            { category_id: '0.3', category_name: 'FAVORITOS', total: 0 }
        ];

        for (const tipo of tipos) {
            let contenido = [];
            const categories = await getCategoriesByType(tipo); // Obtiene las categorías para el tipo actual
            const categorias = [...initialCats, ...categories]; // Combina las categorías iniciales con las nuevas
            
            // Procesa cada categoría de forma secuencial y espera los resultados
            switch (tipo) {
                case 'live':
                    const canales = await getLiveStream();
                    contenido = canales;
                    dispatch(setCatsLive(categorias)); //Guarda las categorias de LIVE en el almacenamiento global
                    dispatch(setLive(canales)); //Guarda el id del stream, visto y favorito de LIVE en el almacenamiento global
                    console.log('LIVE actualizado');
                    break;
                case 'vod':
                    const peliculas = await getVodStream();
                    contenido = peliculas;
                    dispatch(setCatsVod(categorias)); //Guarda las categorias de VOD en el almacenamiento global
                    dispatch(setVod(peliculas)); //Guarda el id del stream, el id de tmdb, visto y favorito de VOD en el almacenamiento global
                    console.log('VOD actualizado');
                    break;
                case 'series':
                    const newSeries = await getSeries();
                    contenido = newSeries;
                    dispatch(setCatsSeries(categorias)); //Guarda las categorias de SERIES en el almacenamiento global
                    dispatch(setSeries(newSeries)); //Guarda el id del stream, el id de tmdb, visto y favorito de SERIES en el almacenamiento global
                    console.log('SERIES actualizado');
                    break;
            }

            categorias.forEach(categoria => {
                switch (categoria.category_id) {
                    case '0.1':
                        dispatch(changeCategoryProperties({
                            type: tipo,
                            categoryId: '0.1',
                            changes: { total: contenido.length }
                        }));
                        break;
                    case '0.2':
                        break;
                    case '0.3':
                        break;
                    default:
                        const filtradro = contenido.filter(content => content.category_id === categoria.category_id);
                        dispatch(changeCategoryProperties({
                            type: tipo,
                            categoryId: categoria.category_id,
                            changes: { total: filtradro.length }
                        }));
                        break;
                }
            });
        }

    };

    const getInfoStreamingByType = async (type) => {

    };

    const getCategoriesByType = async (type) => {
        const newLink = `${url}&action=get_${type}_categories`;

        try {
            const response = await fetch(newLink);
            const categories = await response.json();

            const categorias = categories.map(({ category_id, category_name }) => ({
                category_id,
                category_name,
                total: 0
            }));
            return categorias;
        } catch (error) {
            console.log('Error al obtener las categorias: ', error);
        }
    };

    const getLiveStream = async () => {
        const newLive = [];
        const newLink = `${url}&action=get_live_streams`;

        try {
            const response = await fetch(newLink);
            const stream = await response.json();

            stream.forEach(({ num, name, stream_id, stream_icon, category_id }) => {
                const canal = live?.find(channel => channel.stream_id === stream_id);
                
                newLive.push({
                    num,
                    stream_id,
                    name,
                    stream_icon,
                    category_id,
                    link: `${host}/live/${user}/${password}/${stream_id}.ts`,
                    visto: canal?.visto ?? false,
                    favorito: canal?.favorito ?? false,
                });
            });

            return newLive;
        } catch (error) {
            console.log(`Error al obtener el contenido de LIVE: ${error}`);
        }
    };

    const getVodStream = async () => {
        const newVod = [];
        const newLink = `${url}&action=get_vod_streams`;

        try {
            const response = await fetch(newLink);
            const stream = await response.json();
            stream.forEach(({ num, name, title, year, stream_id, stream_icon, rating, category_id, release_date, container_extension }) => {
                const pelicula = vod?.find(movie => movie.stream_id === stream_id);

                newVod.push({
                    num,
                    stream_id,
                    name,
                    title,
                    year,
                    rating,
                    stream_icon,
                    category_id,
                    release_date,
                    tmdb_id: '',
                    link: `${host}/movie/${user}/${password}/${stream_id}.${container_extension}`,
                    visto: pelicula?.visto ?? false,
                    favorito: pelicula?.favorito ?? false
                });

            });

            return newVod;
        } catch (error) {
            console.log(`Error al obtener el contenido de VOD: ${error}`);
        }
    };

    const getSeries = async () => {
        const newSeries = [];
        const newLink = `${url}&action=get_series`;

        try {
            const response = await fetch(newLink);
            const stream = await response.json();

            stream.forEach(({ num, series_id, name, title, year, cover, plot, genre, category_id, release_date, rating, backdrop_path }) => {
                const serie = series?.find(serie => serie.series_id === series_id);
                const regex = /Saga|Collection/i; // La 'i' hace que sea case-insensitive

                if (regex.test(name)) {
                    newSeries.push({
                        num,
                        series_id,
                        name,
                        title,
                        year,
                        rating,
                        cover,
                        plot,
                        genre,
                        backdrop_path: backdrop_path[0],
                        category_id,
                        release_date,
                        tmdb_id: '',
                        visto: serie?.visto ?? false,
                        favorito: serie?.favorito ?? false,
                        saga: true,
                    })
                } else {
                    newSeries.push({
                        num,
                        series_id,
                        name,
                        title,
                        year,
                        rating,
                        cover,
                        category_id,
                        release_date,
                        tmdb_id: '',
                        visto: serie?.visto ?? false,
                        favorito: serie?.favorito ?? false,
                        saga: false,
                    })
                }
            });

            return newSeries;
        } catch (error) {
            console.log(`Error al obtener el contenido de SERIES: ${error}`);
        }
    };

    const getEpisodes = async (idSerie) => {
        const newLink = `${url}&action=get_series_info&series_id=${idSerie}`;

        try {
            const response = await fetch(newLink);
            const stream = await response.json();
            const newEpisodes = transformEpisodes(stream, idSerie);
            return newEpisodes;
        } catch (error) {
            console.log(`Error al obtener los episodios de la Serie con ID ${idSerie}: ${error}`);
        }
    };

    const transformEpisodes = (data, idSerie) => {
        // data.episodes es un objeto cuyas claves son los números de temporada (en string)
        // y cada valor es un array de episodios de esa temporada
        const episodes = Object.keys(data.episodes).map((seasonKey) => {
            const episode = episodes?.find(episodio => episodio.id === ep.id);
            // Para cada temporada, mapeamos los episodios y extraemos solo la información requerida
            return data.episodes[seasonKey].map((ep) => ({
                id: ep.id,
                episode_num: ep.episode_num,
                title: ep.title,
                plot: ep.info?.plot ?? '',
                duration_secs: ep.info?.duration_secs ?? 0,
                movie_image: ep.info?.movie_image ?? '',
                rating: ep.info?.rating ?? 0,
                season: ep.season,
                link: `${host}/series/${user}/${password}/${ep.id}.${ep.container_extension}`,
                id_serie: idSerie,
                visto: episode?.visto ?? false,
            }));
        });
        return episodes;
    };

    return {
        getInfoAccount,
        getFullStreaming,
        getEpisodes,
    };
};
