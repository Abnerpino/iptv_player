import { useRealm } from "@realm/react";

export const useStreaming = () => {
    const realm = useRealm();

    const upsertNotifications = (newNotifications) => {
        realm.write(() => {
            const allNotifications = realm.objects('Notificacion');
            const newNotificationsIds = newNotifications.map(item => item.id); // Genere un nuevo arreglo de solo los id´s de las nuevas notificaciones
            const missingNotifications = allNotifications.filtered(`NOT (id IN $0)`, newNotificationsIds); // Filtra las notificaciones actuales que ya no se encuentran en las nuevas notificaciones
            realm.delete(missingNotifications); // Elimina las notificaciones faltantes

            newNotifications.forEach(item => {
                const oldNotification = realm.objectForPrimaryKey('Notificacion', item.id);
                let dataToSave = { ...item };

                // Preserva la propiedad 'visto' y 'fecha' de la notificación solo si el mensaje es el mismo
                if (oldNotification && dataToSave.message === oldNotification.message) {
                    dataToSave.visto = oldNotification.visto;
                    dataToSave.fecha = oldNotification.fecha;
                }

                realm.create('Notificacion', dataToSave, 'modified');
            });
        });
    };

    const upsertContentItems = (type, newItems) => {
        const model = getModelName(type);
        const idField = type === 'series' ? 'series_id' : 'stream_id';

        realm.write(() => {
            const allItemsOfType = realm.objects(model);
            const newItemsIds = newItems.map(item => item[idField]); //Genera un nuevo arreglo de solo los id´s de los nuevos items
            const missingItems = allItemsOfType.filtered(`NOT (${idField} IN $0)`, newItemsIds); //Filtra los items actuales que ya no se encuentran en los nuevos items
            realm.delete(missingItems); //Elimina los items faltantes

            newItems.forEach(item => {
                const oldItem = realm.objectForPrimaryKey(model, item[idField]);
                let dataToSave = { ...item };

                // Preserva estado de las propiedades 'visto', 'favorito', 'fecha_visto', 'playback_time' y 'temporadas'
                if (oldItem) {
                    dataToSave.visto = oldItem.visto;
                    dataToSave.favorito = oldItem.favorito;
                    dataToSave.fecha_visto = oldItem.fecha_visto;
                    if (type === 'vod') {
                        dataToSave.playback_time = oldItem.playback_time;
                    }
                    if (type === 'series' && oldItem.temporadas && oldItem.visto) {
                        dataToSave.temporadas = oldItem.temporadas.toJSON();
                        dataToSave.last_ep_played = oldItem.last_ep_played.toJSON();
                    }
                }
                realm.create(model, dataToSave, 'modified');
            });
        });
    };

    const syncStreamingData = (type, categories, items) => {
        return new Promise((resolve, reject) => {
            try {
                // 1. Guardar o actualizar todos los items de contenido (Canales, Películas, Series)
                upsertContentItems(type, items);

                // 2. Guardar o actualizar las categorías y vincular su contenido
                const categoryModel = getModelName(type, true); // 'CatsLive', 'CatsVod', 'CatsSerie'
                const contentModel = getModelName(type); // 'Canal', 'Pelicula', 'Serie'
                const contentField = type === 'live' ? 'canales' : (type === 'vod' ? 'peliculas' : 'series');

                realm.write(() => {
                    const allCategoriesOfType = realm.objects(categoryModel);
                    const newCategoriesIds = categories.map(item => item.category_id); //Genera un nuevo arreglo de solo los id´s de las nuevas categorias
                    const missingCategories = allCategoriesOfType.filtered(`NOT (category_id IN $0)`, newCategoriesIds); //Filtra las categorias actuales que ya no se encuentran en las nuevas categorias
                    realm.delete(missingCategories); //Elimina las categorias faltantes

                    categories.forEach(cat => {
                        // Filtrar los items que pertenecen a esta categoría
                        let itemsForThisCategory = [];

                        switch (cat.category_id) {
                            case '0.1':
                                itemsForThisCategory = realm.objects(contentModel);
                                break;
                            case '0.2':
                                itemsForThisCategory = realm.objects(contentModel).filtered('visto == true');
                                break;
                            case '0.3':
                                itemsForThisCategory = realm.objects(contentModel).filtered('favorito == true');
                                break;
                            default:
                                itemsForThisCategory = realm.objects(contentModel).filtered('$0 IN category_ids', cat.category_id);
                        }

                        // Crear o actualizar la categoría en Realm
                        realm.create(categoryModel, {
                            category_id: cat.category_id,
                            category_name: cat.category_name,
                            total: itemsForThisCategory.length,
                            [contentField]: itemsForThisCategory, // Asigna la lista de items vinculados
                        }, 'modified');
                    });
                });

                resolve();
            } catch (error) {
                console.log(`Error al sincronizar datos en Realm (${type}):`, error);
                reject(error);
            }
        });
    };

    // Método para obtener los items vistos de una colección, ordenados en reversa (descendente) por la propiedad 'fecha_visto' (fecha de visualización más reciente)
    const getWatchedItems = (type) => {
        const model = getModelName(type);
        const items = realm.objects(model).sorted('fecha_visto', true);
        return items.filtered('visto == true');
    };

    // Método para obtener los items vistos de una colección, ordenados por la propiedad 'num
    const getFavoriteItems = (type) => {
        const model = getModelName(type);
        const items = realm.objects(model).sorted('num');
        return items.filtered('favorito == true');
    };

    // Método para obtener el último episodio reproducido de una serie
    const getLastPlayedEpisode = (idSerie, idxSeason, idxEpisode) => {
        const model = getModelName('Serie');
        const serie = realm.objectForPrimaryKey(model, idSerie);
        return serie.temporadas[idxSeason].episodios[idxEpisode];
    };

    // Método para actualizar las propiedades de un item o categoría
    const updateProps = (type, flag, idValue, changes) => {
        const model = getModelName(type, flag);
        realm.write(() => {
            const item = realm.objectForPrimaryKey(model, idValue);
            if (item) {
                Object.entries(changes).forEach(([key, value]) => {
                    item[key] = value;
                });
            }
        });
    };

    // Método para actualizar las propiedades de una temporada
    const updateSeasonProps = (serieId, numSeason, prop, value) => {
        const serie = realm.objectForPrimaryKey('Serie', serieId);
        if (!serie) {
            console.log('No se encontró la serie');
            return;
        } else console.log('Serie encontrada, updateSeasonProps');

        realm.write(() => {
            const temporada = serie.temporadas.find(t => t.numero === numSeason);
            if (temporada) {
                temporada[prop] = value;
            }
        });
    };

    // Método para actualizar las propiedades de un episodio
    const updateEpisodeProps = (serieId, numSeason, episodioId, prop, value) => {
        const serie = realm.objectForPrimaryKey('Serie', serieId);
        if (!serie) {
            console.log('No se encontró la serie');
            return;
        } else console.log('Serie encontrada, updateEpisodeProps');

        const temporada = serie.temporadas.find(t => t.numero === numSeason);
        if (!temporada) {
            console.log('No se encontró la temporada');
            return;
        } else console.log('Temporada encontrada');

        realm.write(() => {
            const episodio = temporada.episodios.find(e => e.id === episodioId);
            if (episodio) {
                episodio[prop] = value;
            }
        });
    };

    // Método para marcar como vista una notificación
    const markNotification = (id) => {
        realm.write(() => {
            const item = realm.objectForPrimaryKey('Notificacion', id);
            if (item) {
                item.visto = true;
            }
        });
    };

    const unmarkItemsAsWatched = (type) => {
        const items = getWatchedItems(type);
        realm.write(() => {
            items.forEach(item => {
                item.visto = false; // Desmarca como Visto el item
                item.fecha_visto = null; // Asigna a 'null' su fecha de visualización

                if (type === 'series') {
                    item.temporadas = []; // Borra las temporadas y sus respectivos episodios
                }
            });
        });
    };

    const unmarkItemsAsFavorite = (type) => {
        const items = getFavoriteItems(type);
        realm.write(() => {
            items.forEach(item => item.favorito = false); // Desmarca como Favorito el item
        });
    };

    const getModelName = (type, forCategory = false) => {
        if (forCategory) {
            if (type === 'live') return 'CatsLive';
            if (type === 'vod') return 'CatsVod';
            return 'CatsSerie';
        }
        if (type === 'live') return 'Canal';
        if (type === 'vod') return 'Pelicula';
        return 'Serie';
    };

    return {
        upsertNotifications,
        syncStreamingData,
        getWatchedItems,
        getFavoriteItems,
        getLastPlayedEpisode,
        updateProps,
        updateSeasonProps,
        updateEpisodeProps,
        markNotification,
        unmarkItemsAsWatched,
        unmarkItemsAsFavorite,
        getModelName,
    };
};