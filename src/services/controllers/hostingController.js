import { collection, addDoc, updateDoc, getDocs, query, where, limit, doc, arrayUnion, arrayRemove } from '@react-native-firebase/firestore';
import db from '../hosting/firebase';
import ErrorLogger from '../logger/errorLogger';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Función para registrar clientes en la Base de Datos de la Nube
export const registrarCliente = async (data) => {
    try {
        await addDoc(collection(db, 'clients'), data);
        return true;
    } catch (error) {
        ErrorLogger.log('HostingController - registrarCliente', error);
        //console.error("Error al registrar cliente: ", error);
        return null;
    }
};

// Función para actualizar campos de un cliente en la Base de Datos de la Nube
export const actualizarCliente = async (id, data) => {
    try {
        const docRef = doc(db, 'clients', id);
        await updateDoc(docRef, data);
    } catch (error) {
        ErrorLogger.log('HostingController - actualizarCliente', error);
        //console.log('Error al actualizar los siguientes campos: ', data);
    }
};

// Función para validar si un username específico ya existe en la Base de Datos de la Nube
export const validarUsername = async (username) => {
    try {
        const q = query(
            collection(db, 'clients'),
            where('username_lower', '==', username),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        return !querySnapshot.empty; // Retorna true si existe, false si está libre
    } catch (error) {
        ErrorLogger.log('HostingController - validarUsername', error);
        //console.error("Error al validar usuario: ", error);
        return false; // En caso de error, asume que no existe
    }
};

// Función para verificar (por el id del dispositivo) si un cliente ya existe en la Base de Datos de la Nube
export const verificarCliente = async (deviceId, forceUpdate = false) => {
    try {
        const isActive = await AsyncStorage.getItem('is_active'); // Verifica que la cuenta del usuario ya esté activa
        const lastUpdate = await AsyncStorage.getItem('last_user_sync'); // Verifica cuándo fue la última actualización
        const cleanUser = await AsyncStorage.getItem('account_deleted'); // Verifica si el usuario no ha sido borrado en la nube
        const now = new Date().getTime();

        // Si el usuario está activo, existe un registro de tiempo, no hay indicación para borrar usuario, no fuerza actualización y el tiempo no ha expirado (3 días)...
        if (isActive && lastUpdate && !cleanUser && !forceUpdate && (now - parseInt(lastUpdate) < 259200000)) {
            return { numId: 2, data: { sync: false } }; // Termina aquí la función y marca como desactivada la bandera de sincronización
        }

        // Si el tiempo expiró o es la primera vez, consulta en FireStore
        const q = query(
            collection(db, 'clients'),
            where('device_id', '==', deviceId),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        // Si existe el cliente...
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const clientData = { id: doc.id, sync: true, ...doc.data() }; // Activa la bandera de sincronización y la agrega a la info del cliente

            // Guarda la nueva fecha de actualización
            await AsyncStorage.setItem('last_user_sync', now.toString());

            return { numId: 2, data: clientData };
        } else { // Si no existe el cliente...
            return { numId: 1, data: [] };
        }
    } catch (error) {
        ErrorLogger.log('HostingController - verificarCliente', error);
        //console.error("Error al obtener el ID del dispositivo: ", error);
        return { numId: -1, data: null };
    }
};

// Función para agregar clientes (por su id) a las notificaciones según su tipo
export const agregarClienteANotificaciones = async (type, clientId) => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('type', '==', type)
        );

        const querySnapshot = await getDocs(q);

        const notificationsIds = querySnapshot.docs.map(doc => {
            return doc.id;
        });

        for (const notificationId of notificationsIds) {
            const docRef = doc(db, 'notifications', notificationId);
            await updateDoc(docRef, {
                clients_id: arrayUnion(clientId)
            });
        }
    } catch (error) {
        ErrorLogger.log('HostingController - agregarClienteANotificaciones', error);
        //console.log('Error al agregar cliente a las notificaciones:', error);
    }
};

// Función para remover clientes (por su id) de las notificaciones
export const removerClienteDeNotificaciones = async (notificationsIds, clientId) => {
    try {
        for (const notificationId of notificationsIds) {
            const docRef = doc(db, 'notifications', notificationId);
            await updateDoc(docRef, {
                clients_id: arrayRemove(clientId)
            });
        }
    } catch (error) {
        ErrorLogger.log('HostingController - removerClienteDeNotificaciones', error);
        //console.log('Error al remover cleinte de las notificaciones:', error);
    }
};

// Función para obtener las notificaciones de la Base de Datos en la Nube
export const obtenerNotificaciones = async (id, type) => {
    try {
        const lastUpdate = await AsyncStorage.getItem('last_notifications_sync'); // Verifica cuándo fue la última actualización de notificaciones
        const now = new Date().getTime();

        // Si no son notificaciones iniciales, existe un registro de tiempo y el tiempo no ha expirado (3 días)...
        if (type !== 'initial' && lastUpdate && (now - parseInt(lastUpdate) < 259200000)) {
            return []; // Termina aquí la función y devuelve un array vacío
        }

        const q = query(
            collection(db, 'notifications'),
            where('type', '==', type),
            where('clients_id', 'array-contains', id)
        );

        const querySnapshot = await getDocs(q);

        const notifications = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                message: data.message,
                visto: false,
                fecha: new Date(),
                fecha_visto: null
            };
        });

        // Guarda la nueva fecha de actualización
        await AsyncStorage.setItem('last_notifications_sync', now.toString());

        return notifications;
    } catch (error) {
        ErrorLogger.log('HostingController - obtenerNotificaciones', error);
        //console.log('Error al obtener las notificaciones: ', error);
        return null;
    }
};

// Función para obtener los revendedores de la Base de Datos en la Nube
export const obtenerRevendedores = async () => {
    try {
        const q = query(collection(db, 'resellers'));

        const querySnapshot = await getDocs(q);

        const resellers = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                bank: data.bank,
                country_code: data.country_code,
                email: data.email,
                name: data.name,
                number_card: data.number_card,
                whatsapp: data.whatsapp
            };
        });

        return resellers;
    } catch (error) {
        ErrorLogger.log('HostingController - obtenerRevendedores', error);
        //console.log('Error al obtener los revendedores: ', error);
        return null;
    }
};

// Función para obtener las keys (TMDB API) de la Base de Datos en la Nube
export const obtenerKeys = async (type) => {
    try {
        const q = query(
            collection(db, 'keys'),
            where('type', '==', type)
        );

        const querySnapshot = await getDocs(q);

        const keys = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return data.key;
        });

        return keys;
    } catch (error) {
        ErrorLogger.log('HostingController - obtenerKeys', error);
        //console.log('Error al obtener las keys:', error);
        return null;
    }
};