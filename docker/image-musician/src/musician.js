import dgram from "dgram";
import {v4 as uuidv4} from "uuid";


// adresse et port utile pour le groupe multicast
const MULTICAST_ADDRESS = "239.255.22.5";
const MULTICAST_PORT = 22055;


// création de la map contenant les différents instruments et les sons
// produits par ces dernier.
const instrumentTypeSound = new Map([
                                        ["piano", "ti-ta-ti"],
                                        ["trumpet", "pouet"],
                                        ["flute", "trulu"],
                                        ["violin", "gzi-gzi"],
                                        ["drum", "boum-boum"]]);

//recuperation du nom de l'instrument
const instrumentType = process.argv[2];

// recuperation du son de l'instrument grâce a la map et création d'un uuid
const sound = instrumentTypeSound.get(instrumentType);
const uuid = uuidv4();

// Création du datagram socket
const s = dgram.createSocket('udp4');

// Cette fonction va servir a envoyer un son toute les secondes en upd a
// l'adresse multicast
function sendSound(){

    const dataObject = {
        uuid : uuid,
        sound : sound
    }
    const payload = JSON.stringify(dataObject)

    // envoyer le payload dans un datagram UDP
    s.send(payload, 0, payload.length, MULTICAST_PORT, MULTICAST_ADDRESS);
}


// on appel une fois la fonction et ensuite le setInterval va l'appeler toutes
// les secondes
sendSound();
setInterval(() => sendSound(), 1000);