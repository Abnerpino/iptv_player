class M3UController {
    parseM3U = () => {
        const m3uContent = 
            `#EXTM3U
            #EXTINF:-1 tvg-id="" tvg-name="UNIVISION MIAMI (exclusivo)" tvg-logo="https://i.postimg.cc/zXHhtK25/My-project-2024-01-28-T221017-348-removebg-preview.png" group-title="ENTRETENIMIENTO & NOVELAS",UNIVISION MIAMI (exclusivo)
            http://masterplus.live:8080/Prueba0001/5euk79TnfK/373788.m3u8
            #EXTINF:-1 tvg-id="TUDN" tvg-name="TUDN (exclusivo full hd)" tvg-logo="https://i.postimg.cc/sfmWWMDq/My-project-60-removebg-preview-1.png" group-title="DEPORTES MEXICO",TUDN (exclusivo full hd)
            http://masterplus.live:8080/Prueba0001/5euk79TnfK/92328.m3u8
            #EXTINF:-1 tvg-id="Cartoon Network.co" tvg-name="CARTOON NETWORK (exclusivo hd)" tvg-logo="https://i.postimg.cc/Rhz7NqLv/My-project-12-removebg-preview.png" group-title="MEXICO PREMIUM",CARTOON NETWORK (exclusivo hd)
            http://masterplus.live:8080/Prueba0001/5euk79TnfK/253126.m3u8`
        ;

        const lines = m3uContent.split('\n').map(line => line.trim()); // Eliminar espacios en blanco
        //console.log(lines);
        let channels = [];
      
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.startsWith('#EXTINF')) {
            //console.log(line);
            const channelInfo = line.match(/#EXTINF:-1.*,(.+)/)[1];
            const streamUrl = lines[i + 1];  // La URL del stream está en la siguiente línea
            //console.log(channelInfo);
            //console.log(streamUrl);
            channels.push({
              name: channelInfo, 
              url: streamUrl
            });
            //console.log(channels);
          } //else console.log("Sin coincidencias");
        }
        //console.log(channels);
        return channels;
      };
      
}

export default M3UController;