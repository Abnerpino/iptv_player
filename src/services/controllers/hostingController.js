import { collection, addDoc, getDocs, query, where, limit } from '@react-native-firebase/firestore';
import db from '../hosting/firebase';
import ErrorLogger from '../logger/errorLogger';

class HostingController {
    // Función para registrar clientes en la Base de Datos de la Nube
    async registrarCliente(data) {
        try {
            await addDoc(collection(db, 'clients'), data);
            return true;
        } catch (error) {
            ErrorLogger.log('HostingController - registrarCliente', error);
            //console.error("Error al registrar cliente: ", error);
            return null;
        }
    }

    // Función para validar si un username específico ya existe en la Base de Datos de la Nube
    async validarUsername(username) {
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
    }

    // Función para verificar (por el id del dispositivo) si un cliente ya existe en la Base de Datos de la Nube
    async verificarCliente(deviceId) {
        try {
            const q = query(
                collection(db, 'clients'),
                where('device_id', '==', deviceId),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) { 
                // Si existe el cliente
                const doc = querySnapshot.docs[0];
                
                const clientData = { id: doc.id, ...doc.data() };
                
                return { numId: 2, data: clientData }; 
            } else { 
                // Si no existe el cliente
                return { numId: 1, data: [] }; 
            }
        } catch (error) {
            ErrorLogger.log('HostingController - verificarCliente', error);
            //console.error("Error al obtener el ID del dispositivo: ", error);
            return { numId: -1, data: null };
        }
    }

    // Función para obtener las notificaciones de la Base de Datos en la Nube
    async obtenerNotificaciones(id) {
        try {
            const q = query(
                collection(db, 'notifications'),
                where('clients_id', 'array-contains', id)
            );

            const querySnapshot = await getDocs(q);

            const notifications = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    message: data.message,
                    visto: false,
                    fecha: new Date()
                };
            });
            
            return notifications;
        } catch (error) {
            ErrorLogger.log('HostingController - obtenerNotificaciones', error);
            //console.log('Error al obtener las notificaciones: ', error);
            return null;
        }
    }
}

export default HostingController;