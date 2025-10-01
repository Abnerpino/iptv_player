import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCatsLive, setCatsVod, setCatsSeries, setLive, setVod, setSeries, changeCategoryProperties } from '../redux/slices/streamingSlice';
import { getRealm } from '../realm/index';
import { saveItems, updateItemPropsInSchema, getItems } from '../realm/streaming';

export const useXtream = () => {
    const dispatch = useDispatch();
    const realm = getRealm();
    const { user, password, host } = useSelector(state => state.client);
    //const { live, vod, series } = useSelector(state => state.streaming);
    const url = `${host}/player_api.php?username=${user}&password=${password}`;
    const tipos = ['live', 'vod', 'series'];
    const initialCats = [
        { category_id: '0.1', category_name: 'TODO', total: 0 },
        { category_id: '0.2', category_name: 'RECIENTEMENTE VISTO', total: 0 },
        { category_id: '0.3', category_name: 'FAVORITOS', total: 0 }
    ];

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
        console.log('getFullStreaming');
        for (const tipo of tipos) {
            await getStreamingByType(tipo);
        }
        console.log('FIN');
    };

    const getStreamingByType = async (type) => {
        console.log(type);
        let contenido = [];
        const categories = await getCategoriesByType(type); // Obtiene las categorías para el tipo actual
        const categorias = [...initialCats, ...categories]; // Combina las categorías iniciales con las nuevas

        // Procesa cada categoría de forma secuencial y espera los resultados
        switch (type) {
            case 'live':
                const canales = await getLiveStream();
                contenido = canales;
                dispatch(setCatsLive(categorias)); //Guarda las categorias de LIVE en el almacenamiento global
                await saveItems('live', canales);
                updateItemPropsInSchema('auxLive', 'live');
                console.log('LIVE actualizado');
                break;
            case 'vod':
                const peliculas = await getVodStream();
                contenido = peliculas;
                dispatch(setCatsVod(categorias)); //Guarda las categorias de VOD en el almacenamiento global
                await saveItems('vod', peliculas);
                updateItemPropsInSchema('auxVod', 'vod');
                console.log('VOD actualizado');
                break;
            case 'series':
                const series = await getSeries();
                contenido = series;
                dispatch(setCatsSeries(categorias)); //Guarda las categorias de SERIES en el almacenamiento global
                await saveItems('series', series);
                updateItemPropsInSchema('auxSeries', 'series');
                console.log('SERIES actualizado');
                break;
        }

        categorias.forEach(categoria => {
            switch (categoria.category_id) {
                case '0.1':
                    dispatch(changeCategoryProperties({
                        type: type,
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
                        type: type,
                        categoryId: categoria.category_id,
                        changes: { total: filtradro.length }
                    }));
                    break;
            }
        });
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
            return [];
        }
    };

    const getLiveStream = async () => {
        const newLive = [];
        const newLink = `${url}&action=get_live_streams`;
        //const live = getItems('live');

        try {
            const response = await fetch(newLink);
            const stream = await response.json();

            stream.forEach(({ num, name, stream_id, stream_icon, category_id, category_ids, direct_source }) => {
                //const canal = live?.find(channel => channel.stream_id === stream_id);

                newLive.push({
                    num: num.toString(),
                    name: name ? name : stream_id.toString(),
                    stream_id: stream_id.toString(),
                    stream_icon,
                    category_id,
                    category_ids: category_ids.map(category => category.toString()),
                    link: direct_source ? direct_source : `${host}/live/${user}/${password}/${stream_id}.ts`,
                    favorito: false,//canal?.favorito ?? false,
                    visto: false//canal?.visto ?? false,
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
        //const vod = getItems('vod');

        try {
            const response = await fetch(newLink);
            const stream = await response.json();
            stream.forEach(({ num, name, title, year, stream_id, stream_icon, rating, plot, genre, category_id, category_ids, release_date, episode_run_time, container_extension }) => {
                //const pelicula = vod?.find(movie => movie.stream_id === stream_id);

                newVod.push({
                    num: num.toString(),
                    name: name ? name : stream_id.toString(),
                    title,
                    year,
                    stream_id: stream_id.toString(),
                    stream_icon,
                    rating: rating ? rating.toString() : '0',
                    plot,
                    genre,
                    release_date,
                    episode_run_time: episode_run_time ? episode_run_time.toString() : '',
                    category_id,
                    category_ids: category_ids.map(category => category.toString()),
                    tmdb_id: '',
                    backdrop_path: '',
                    original_title: '',
                    overview: '',
                    poster_path: '',
                    runtime: '',
                    genres: '',
                    vote_average: '',
                    cast: '',
                    link: `${host}/movie/${user}/${password}/${stream_id}.${container_extension}`,
                    favorito: false,//pelicula?.favorito ?? false,
                    visto: false//pelicula?.visto ?? false
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
        //const series = getItems('series');

        try {
            const response = await fetch(newLink);
            const stream = await response.json();

            stream.forEach(({ num, series_id, name, title, year, cover, plot, genre, category_id, category_ids, release_date, rating, backdrop_path }) => {
                //const serie = series?.find(serie => serie.series_id === series_id);
                const regex = /Saga|Collection/i; // La 'i' hace que sea case-insensitive

                newSeries.push({
                    num: num.toString(),
                    name: name ? name : series_id.toString(),
                    title,
                    year,
                    series_id: series_id.toString(),
                    cover,
                    plot,
                    genre,
                    release_date,
                    rating,
                    backdrop_path: backdrop_path[0],
                    category_id,
                    category_ids: category_ids.map(category => category.toString()),
                    tmdb_id: '',
                    original_name: '',
                    backdrop_path_aux: '',
                    vote_average: '',
                    poster_path: '',
                    genres: '',
                    overview: '',
                    cast: '',
                    temporadas: [],//(serie && serie.temporadas.length > 0) ? serie.temporadas : [],
                    favorito: false,//serie?.favorito ?? false,
                    visto: false,//serie?.visto ?? false,
                    saga: regex.test(name) ? true : false,
                });
            });

            return newSeries;
        } catch (error) {
            console.log(`Error al obtener el contenido de SERIES: ${error}`);
        }
    };

    const getEpisodes = async (idSerie) => {
        const newLink = `${url}&action=get_series_info&series_id=${idSerie}`;
        const serie = realm.objectForPrimaryKey('Serie', idSerie);

        try {
            if (serie && serie.temporadas.length > 0) {
                console.log('Ya existen episodios');
            } else {
                const response = await fetch(newLink);
                const stream = await response.json();
                transformEpisodes(stream, idSerie, serie);
                /*realm.write(() => {
                    serie.temporadas.push(...episodios);
                });*/
                console.log('Se agregaron los episodios');
                return true;
            }
        } catch (error) {
            console.log(`Error al obtener los episodios de la Serie con ID ${idSerie}: ${error}`);
        }
    };

    const transformEpisodes = (data, idSerie, serie) => {
        // data.episodes es un objeto cuyas claves son los números de temporada (en string)
        // y cada valor es un array de episodios de esa temporada
        Object.keys(data.episodes).forEach((seasonKey) => {
            // Para cada temporada, mapeamos los episodios y extraemos solo la información requerida
            const episodesInSeason = data.episodes[seasonKey].map((ep) => ({
                id: ep.id,
                episode_num: ep.episode_num,
                title: ep.title ? ep.title : ep.id,
                plot: ep.info?.plot ?? '',
                duration_secs: ep.info?.duration_secs?.toString() ?? '0',
                movie_image: ep.info?.movie_image ?? '',
                rating: ep.info?.rating?.toString() ?? '0',
                season: ep.season?.toString() ?? '0',
                id_serie: idSerie,
                link: `${host}/series/${user}/${password}/${ep.id}.${ep.container_extension}`,
                visto: false,
            }));

            try {
                realm.write(() => {
                    serie.temporadas.push({
                        numero: seasonKey,
                        episodios: episodesInSeason
                    });
                });
            } catch (error) {
                console.log('transformEpisodes: ', error);
            }
        });
    };

    return {
        getInfoAccount,
        getFullStreaming,
        getStreamingByType,
        getEpisodes,
    };
};
