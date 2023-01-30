import dgram from "dgram";
import net from "net";


// adresse et port utile pour le groupe multicast et le port TCP
const MULTICAST_ADDRESS = "239.255.22.5";
const MULTICAST_PORT = 22055;
const TCP_PORT = 2205;

// création de la map contenant les sons produits et  les différents instruments
const instrumentSoundType = new Map([
                                    ["ti-ta-ti", "piano"],
                                    ["pouet", "trumpet"],
                                    ["trulu", "flute"],
                                    ["gzi-gzi", "violin"],
                                    ["boum-boum", "drum"]]);

//tableau pour stocker les musiciens
var musicians = [];


// création du datagram socket UPD et liaison au groupe multicast
const s = dgram.createSocket('udp4');
s.bind(MULTICAST_PORT, function() {
    s.addMembership(MULTICAST_ADDRESS);
});


//recuperation du payload envoyer par un musicien, si ce dernier est
// nouveau, on l'ajoute dans le tableau sinon, on remet le temps d'envoie
// entre 2 sons à 0
s.on('message', function(msg, source) {

    var dataObject = JSON.parse(msg);

    var newData = true;
    musicians.forEach(function(musicians) {
        if(musicians.uuid === dataObject.uuid){
            newData = false;
        }
    });

    if(newData){
        const newMusician = {
            uuid : dataObject.uuid,
            instrument : instrumentSoundType.get(dataObject.sound),
            activeSince : new Date(Date.now()).toISOString(),
            secondsSinceLastUpdate : 0
        };

        musicians.push(newMusician);

    } else {
        var musicianToUpdate = musicians.find(musician => musician.uuid === dataObject.uuid);
        musicianToUpdate.secondsSinceLastUpdate = 0;
    }
});


// fonction qui supprime du tableau les musiciens qui ne sont plus actif
function kickInactiveMusician() {
    musicians.forEach(musician => musician.secondsSinceLastUpdate++);
    musicians = musicians.filter(musician => musician.secondsSinceLastUpdate <= 5);
}

// on execute cette fonction toutes les secondes
setInterval(() => kickInactiveMusician(), 1000);



var tcpServer = net.createServer(function(socket) {
    var payload = musicians;

    payload.forEach(musician => delete musician.secondsSinceLastUpdate);
    socket.write(JSON.stringify(payload));
    socket.pipe(socket);
    socket.destroy();
})

tcpServer.listen(TCP_PORT);