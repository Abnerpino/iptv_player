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
                return result; //Retorna toda la información del cliente
            } else { //Si todavía no existe
                const users = allRecords.map(record => record.user_name.toLowerCase()); //Genera un nuevo arreglo de solo nombres de usuario
                return users; //Retorna los usuarios
            }
        } catch (error) {
            console.error("Error al obtener el ID del dispositivo: ", error);
            return null; //Retorna null si falla la petición
        }
    }

    async obtenerNotificaciones(id) {
        try {
            const allRecords = await pb.collection('notifications').getFullList({
                filter: `client_id = "${id}"`
            }); //Obtiene todos los registros relacionados con el cliente
            const notifications = allRecords.map(record => record.message); //Genera un nuevo arreglo de solo las notificaciones del cliente
            return notifications;
        } catch (error) {
            console.log('Error al obtener las notificaciones: ', error);
            return null;
        }
    }
}

export default HostingController;