import { getRealm } from './index';

const realm = getRealm();

// Método para guardar/actualizar items en una colección
export const upsertItems = (type, newItems) => {
  return new Promise((resolve, reject) => {
    try {
      const model = getModelName(type); //Obtiene el modelo dependiendo el tipo
      realm.write(() => {
        const oldItems = realm.objects(model); //Obtiene todos los items guardados (antiguos)
        const idField = type === 'series' ? 'series_id' : 'stream_id';
        const newItemsIds = newItems.map(item => item[idField]); //Define la lista de ids que se van a mantener
        const missingItems = oldItems.filtered(`NOT (${idField} IN $0)`, newItemsIds); //Filtra los items que no están en la nueva lista
        realm.delete(missingItems); //Elimina los items faltantes
        newItems.forEach(item => {
          const oldItem = realm.objectForPrimaryKey(model, item[idField]); //Busca si el ítem actual ya existe en la base de datos
          if (oldItem) {
            // Si existe, crea un nuevo objeto para guardar
            const dataToSave = {
              ...item, // Copia todas las propiedades del nuevo ítem
              visto: oldItem.visto, // Pero sobrescribe 'Visto' con el valor antiguo
              favorito: oldItem.favorito, // Y también 'Favorito' con el valor antiguo
            };
            // Si es una serie que tiene temporadas guardadas y ya está marcada como 'Visto', hace una copia profunda
            if (type === 'series' && oldItem.temporadas && oldItem.visto) {
              // .toJSON() convierte la lista de Realm y todos sus objetos embebidos en un array de objetos de JavaScript puro
              dataToSave.temporadas = oldItem.temporadas.toJSON();
            }
            realm.create(model, dataToSave, 'modified');
          } else {
            realm.create(model, item, 'modified'); // Si no existe, simplemente crea el nuevo ítem como venía
          }
        });
      });
      resolve();
    } catch (error) {
      console.log(`Error al insertar/actualizar en Realm (${type}:`, error);
    }
  });
};

/*export const saveItems = (type, data) => {
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
};*/

// Método para guardar o actualizar las propiedades 'Favorito', 'Visto' y 'Temporada' (cuando es Serie) en los items de los schemas auxiliares
/*export const saveOrUpdateItems = (type, item) => {
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
};*/

// Método para obtener todo los items de una colección, ordenados por la propiedad 'num
export const getItems = (type) => {
  const model = getModelName(type);
  return realm.objects(model).sorted('num');
};

/*export const getItemById = (type, id) => {
  const model = getModelName(type);
  return realm.objectForPrimaryKey(model, id);
};*/

// Método para actualizar las propiedades de un item
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
/*export const updateItemPropsInSchema = (typeAux, type) => {
  const items = getItems(typeAux);  // Obtiene los items del schema auxiliar

  for (const item of items) {
    if (type === 'series') {
      updateItem(type, 'series_id', item.series_id, { temporadas: item.temporadas, favorito: item.favorito, visto: item.visto });  // Actualiza las propiedades del item en su schema principal
    } else { // Canales y Peliculas
      updateItem(type, 'stream_id', item.stream_id, { favorito: item.favorito, visto: item.visto });  // Actualiza las propiedades del item en su schema principal
    }
  }
};*/

// Método para eliminar items de los schemas auxiliares
/*export const deleteItem = (type, idValue) => {
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
};*/

// Método para marcar un episodio como 'Visto'
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
  return 'Serie';
};