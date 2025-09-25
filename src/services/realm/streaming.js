import { getRealm } from './index';

const realm = getRealm();

export const saveItems = (type, data) => {
  return new Promise((resolve, reject) => {
    try {
      let idContenido = -1;
      const model = getModelName(type);
      realm.write(() => {
        // Limpia primero para evitar duplicados
        const old = realm.objects(model);
        realm.delete(old);

        data.forEach(item => {
          const id = type === 'series' ? item.series_id : item.stream_id;
          if (id !== idContenido) {
            realm.create(model, item);
            idContenido = id;
          }
        });

      });
      resolve();
    } catch (error) {
      console.error(`Error al guardar en Realm (${type}):`, error);
      reject(error);
    }
  });
};

// Método para guardar o actualizar las propiedades 'Favorito', 'Visto' y 'Temporada' (cuando es Serie) en los items de los schemas auxiliares
export const saveOrUpdateItems = (type, item) => {
  const model = getModelName(type);
  realm.write(() => {
    try {
      // El parámetro 'modified' le indica a Realm que actualice un objeto si existe, o lo cree si es nuevo.
      // Solo los campos que han cambiado en 'item' serán actualizados.
      realm.create(model, item, 'modified');
    } catch (error) {
      console.log(error);
    }
  });
};

export const getItems = (type) => {
  const model = getModelName(type);
  return realm.objects(model).sorted('num');
};

export const getItemById = (type, id) => {
  const model = getModelName(type);
  return realm.objectForPrimaryKey(model, id);
};

// Método para actualizar las propiedades de los schemas principales
export const updateItem = (type, idKey, idValue, changes) => {
  const model = getModelName(type);
  realm.write(() => {
    const item = realm.objectForPrimaryKey(model, idValue);
    if (item) {
      Object.entries(changes).forEach(([key, value]) => {
        item[key] = value;
      });
    }
  });
};

// Método para actualizar las propiedades de los items de un schema principal usando las propiedades de esos items en su schema auxiliar
export const updateItemPropsInSchema = (typeAux, type) => {
  const items = getItems(typeAux);  // Obtiene los items del schema auxiliar

  for (const item of items) {
    if (type === 'series') {
      updateItem(type, 'series_id', item.series_id, { temporadas: item.temporadas, favorito: item.favorito, visto: item.visto });  // Actualiza las propiedades del item en su schema principal
    } else { // Canales y Peliculas
      updateItem(type, 'stream_id', item.stream_id, { favorito: item.favorito, visto: item.visto });  // Actualiza las propiedades del item en su schema principal
    }
  }
};

// Método para eliminar items de los schemas auxiliares
export const deleteItem = (type, idValue) => {
  const model = getModelName(type);

  realm.write(() => {
    try {
      // Busca el objeto directamente por su clave primaria.
      const itemToDelete = realm.objectForPrimaryKey(model, idValue);

      // Si se encontró el objeto, se elimina.
      if (itemToDelete) {
        realm.delete(itemToDelete);
        console.log('Ítem eliminado exitosamente.');
      } else {
        console.log('No se encontró el ítem para eliminar.');
      }
    } catch (error) {
      console.error('Error al eliminar el ítem:', error);
    }
  });
};

export const marckEpisodeAsWatched = (serieId, numSeason, episodioId) => {
  const serie = realm.objectForPrimaryKey('Serie', serieId);
  if (!serie) {
    console.log('No se encontró la serie');
    return;
  } else console.log('Serie encontrada');

  const temporada = serie.temporadas.find(t => t.numero === numSeason);
  if (!temporada) {
    console.log('No se encontró la temporada');
    return;
  } else console.log('Temporada encontrada');

  realm.write(() => {
    const episodio = temporada.episodios.find(e => e.id === episodioId);
    if (episodio) {
      episodio.visto = true;
    }
  });
};

export const getModelName = (type) => {
  if (type === 'live') return 'Canal';
  if (type === 'vod') return 'Pelicula';
  if (type === 'series') return 'Serie'
  if (type === 'auxLive') return 'CanalAux';
  if (type === 'auxVod') return 'PeliculaAux';
  return 'SerieAux';
};