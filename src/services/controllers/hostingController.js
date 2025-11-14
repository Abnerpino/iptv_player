import pb from '../hosting/pocketbase';

class HostingController {
    async registrarCliente(data) {
        try {
            await pb.collection('clients').create(data);
            return true;
        } catch (error) {
            console.error("Error al registrar cliente: ", error);
            return null;
        }
    }

    async verificarCliente(deviceId) {
        try {
            const allRecords = await pb.collection('clients').getFullList(); //Obtiene la lista completa de los clientes
            const result = allRecords.find(record => record.device_id === deviceId); //Busca si ya existe algún cliente con el id del dispositivo

            if (result) { //Si ya existe...
                console.log("Ya existe el device_id");
                return { numId: 2, data: result }; //Retorna toda la información del cliente
            } else { //Si todavía no existe
                const users = allRecords.map(record => record.username.toLowerCase()); //Genera un nuevo arreglo de solo nombres de usuario
                return { numId: 1, data: users }; //Retorna los usuarios
            }
        } catch (error) {
            console.error("Error al obtener el ID del dispositivo: ", error);
            return {numId: -1, data: null}; //Retorna null si falla la petición
        }
    }

    async obtenerNotificaciones(id) {
        try {
            //Obtiene todos los registros relacionados con el cliente
            const allRecords = await pb.collection('notifications').getFullList({
                filter: `client_id ~ "${id}"`
            });

            //Genera un nuevo arreglo de objetos para las notificaciones del cliente
            const notifications = allRecords.map(record => ({
                id: record.id,
                message: record.message,
                visto: false,
                fecha: new Date()
            }));
            
            return notifications;
        } catch (error) {
            console.log('Error al obtener las notificaciones: ', error);
            return null;
        }
    }
}

export default HostingController;