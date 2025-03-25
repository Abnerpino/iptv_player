import pb from '../hosting/pocketbase';

class HostingController {
    async registrarDispositivo(data) {
        try {
            const record = await pb.collection('clients').create(data); 
        } catch (error) {
            console.error("Error al registrar cliente: ", error);
            throw new Error("Error al registrar cliente: " + error.message);
        }
    }

    async obtenerDispositivo(deviceId) {
        try {
            const records = await pb.collection('clients').getList(1, 50, {
                filter: `device_id="${deviceId}"`,
            });
    
            if (records.items.length > 0) {
                console.log('El device_id existe:');
                return records.items[0];
            } else {
                console.log('El device_id no existe.');
                return null;
            }
        } catch (error) {
            console.error("Error al obtener el ID del dispositivo");
        }
    }
}

export default HostingController;