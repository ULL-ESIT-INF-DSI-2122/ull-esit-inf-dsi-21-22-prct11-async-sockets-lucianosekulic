import {EventEmitter} from 'events';

/**
 * Clase para gestionar los eventos del eventemitter 
 * del argumento que se le pasa
 */
export class RequestEventEmitterServer extends EventEmitter {
  constructor(connection: EventEmitter) {
    super();
    let information = '';
    connection.on('data', (element) => {
      information += element;

      let aux = information.indexOf('\n');
      while (aux !== -1) {
        const mensaje = information.substring(0, aux);
        information = information.substring(aux + 1);
        this.emit('request', JSON.parse(mensaje));
        aux = information.indexOf('\n');
      }
    });
  };
}