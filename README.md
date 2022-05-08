# Informe Practica 11: Cliente y servidor para una aplicación de procesamiento de notas de texto

[![Coveralls](https://github.com/ULL-ESIT-INF-DSI-2122/ull-esit-inf-dsi-21-22-prct11-async-sockets-lucianosekulic/actions/workflows/coveralls.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2122/ull-esit-inf-dsi-21-22-prct11-async-sockets-lucianosekulic/actions/workflows/coveralls.yml)

[![Sonar-Cloud](https://github.com/ULL-ESIT-INF-DSI-2122/ull-esit-inf-dsi-21-22-prct11-async-sockets-lucianosekulic/actions/workflows/sonarcloud.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2122/ull-esit-inf-dsi-21-22-prct11-async-sockets-lucianosekulic/actions/workflows/sonarcloud.yml)

[![Tests](https://github.com/ULL-ESIT-INF-DSI-2122/ull-esit-inf-dsi-21-22-prct11-async-sockets-lucianosekulic/actions/workflows/node.js.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2122/ull-esit-inf-dsi-21-22-prct11-async-sockets-lucianosekulic/actions/workflows/node.js.yml)


# types.ts

```
export type NotasJSON = {
    usuario: string;
    titulo: string;
    contenido?: string;
    color?: string;
  }
  
  export type RequestType = {
    tipo: 'add' | 'update' | 'remove' | 'read' | 'list';
    usuario: string,
    titulo?: string;
    contenido?: string;
    color?: string;
  };
  
  export type ResponseType = {
    tipo: 'add' | 'update' | 'remove' | 'read' | 'list';
    exito: boolean;
    color?: boolean
    notas?: NotasJSON[];
  };
``` 

Son los distintos types que se llevaran a cabo para la realización de esta practica y esta compuesto por:
* NotasJSON: se almacena el usuario, el titulo, el contenido y color de la nota.
* RequestType: Se encuentra el tipo de peticion ademas de lo que está en notasJson.
* ResponseType: Se encuentra el tipo de acción, si ha tenido exito, el color de verificación de validez y un array de notas.

# Cliente.ts

```
import * as yargs from 'yargs';
import * as chalk from 'chalk';
import * as net from 'net';
import {RequestType, ResponseType} from './types';

 function escribirColor(texto :string, color :string, inverse :boolean = false) {
  switch (color) {
    case 'yellow':
      console.log(
        (inverse) ? chalk.yellow.inverse(texto) : chalk.yellow(texto),
      );
      break;

    case 'green':
      console.log(
        (inverse) ? chalk.green.inverse(texto) : chalk.green(texto),
      );
      break;

    case 'red':
      console.log(
        (inverse) ? chalk.red.inverse(texto) : chalk.red(texto),
      );
      break;
    
    case 'blue':
      console.log(
        (inverse) ? chalk.blue.inverse(texto) : chalk.blue(texto),
      );
      break;
  }
}

const socket = net.connect({port: 60300});
socket.on('error', () => {
  console.log(`Ha ocurrido un error con el servidor`);
});

socket.on('data', (data) => {
  const ResponseData: ResponseType = JSON.parse(data.toString());
  switch (ResponseData.tipo) {
    case 'add':
      if ( ResponseData.exito) {
        console.log(chalk.green(`Nueva nota creada`));
      } else {
        if (!ResponseData.color) {
          console.log(chalk.red(`Ha habido un problema con el color`));
        } else {
          console.log(chalk.red(`Ha ocurrido un error con la nota`));
        }
      }
      break;
    case 'read':
      if ( ResponseData.exito) {
        console.log(
            chalk.green(`${ResponseData.notas![0].titulo} se ha leido correctamente`),
        );

        escribirColor(ResponseData.notas![0].titulo,ResponseData.notas![0].color!,true,);

        escribirColor(`${ResponseData.notas![0].contenido}`,`${ResponseData.notas![0].color}`,);
      } else {
        console.log(chalk.red(`Nota no encontrada`));
      }
      break;
    case 'list':
      if ( ResponseData.exito) {
        console.log(
            chalk.green(`Se ha leido correctamente`),
        );
        console.log(
            chalk.white.inverse(`Notas`),
        );
        ResponseData.notas?.forEach((element) => {
          escribirColor(element.titulo, element.color!);
        });
      } else {
        console.log(chalk.red(`Ha ocurrido un error`));
      }
      break;
    case 'remove':
      if ( ResponseData.exito) {
        console.log(
            chalk.green(`Nota eliminada`),
        );
      } else {
        console.log(chalk.red(`Ha ocurrido un error`));
      }
      break;
    default:
        break;
  }
  socket.end();
});

 yargs.command({
  command: 'add',
  describe: 'Añade una nueva nota',
  builder: {
    usuario: {
      describe: 'Usuario',
      demandOption: true,
      type: 'string',
    },
    titulo: {
      describe: 'Titulo de la nota',
      demandOption: true,
      type: 'string',
    },
    contenido: {
      describe: 'Contenido de la nota',
      demandOption: true,
      type: 'string',
    },
    color: {
      describe: 'Color de la nota',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.usuario === 'string' && typeof argv.titulo === 'string' && typeof argv.contenido === 'string' && typeof argv.color === 'string') {
      const RequestJSON: RequestType = {
        tipo: 'add',
        usuario: `${argv.usuario}`,
        titulo: `${argv.titulo}`,
        contenido: `${argv.contenido}`,
        color: `${argv.color}`,
      };
      
      socket.write(JSON.stringify(RequestJSON) + `\n`);
    }
  },
});

 yargs.command({
  command: 'remove',
  describe: 'Elimina una nota',
  builder: {
    usuario: {
      describe: 'Usuario',
      demandOption: true,
      type: 'string',
    },
    titulo: {
      describe: 'Titulo de la nota',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.usuario === 'string' && typeof argv.titulo === 'string') {
      const RequestJSON: RequestType = {
        tipo: 'remove',
        usuario: `${argv.usuario}`,
        titulo: `${argv.titulo}`,
      };

      socket.write(JSON.stringify(RequestJSON) + `\n`);
    }
  },
});

 yargs.command({
  command: 'list',
  describe: 'Lista las notas de un usuario',
  builder: {
    usuario: {
      describe: 'Usuario',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.usuario === 'string') {
      const RequestJSON: RequestType = {
        tipo: 'list',
        usuario: `${argv.usuario}`,
      };

      socket.write(JSON.stringify(RequestJSON) + `\n`);
    }
  },
});

 yargs.command({
  command: 'read',
  describe: 'Lee una nota',
  builder: {
    usuario: {
      describe: 'Usuario',
      demandOption: true,
      type: 'string',
    },
    titulo: {
      describe: 'Titulo de la nota',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.usuario === 'string' && typeof argv.titulo === 'string') {
      const RequestJSON: RequestType = {
        tipo: 'remove',
        usuario: `${argv.usuario}`,
        titulo: `${argv.titulo}`,
      };

      socket.write(JSON.stringify(RequestJSON) + `\n`);
    }
  },
});

 yargs.argv;
```

En este fichero se han mantenido ciertas cosas de la practica pasada y se han añadadido los siguientes elementos:
* La conexión al socket y comprobación de errores, en el caso de que no hayan fallos se obtiene un request donde se almacena la información del yargs en el comando
tales como el tipo de petición el usuario de la nota, el titulo de la nota, el contenido de la nota y el color con el que se pretende escribir dicha nota.
Luego, mediante ***stringify*** se transforma el contenido de JSON a string.
* En cuanto a la respuesta de la solicitud, el socket hace de escucha para recibir los datos y con el callback se detenta la información necesaria.
* Haciendo uso del type de respuesta se puede tener una idea de como ha ido la operación.
* Con socket.end se detecta que el mensaje se recibio bien.


# Servidor.ts

```
import * as net from 'net';
import {RequestEventEmitterServer} from './requestEventEmitterServer';
import {Notas} from './notas';

const notas: Notas = Notas.getNotas();

const server = net.createServer((connection) => {
  const serverEvent = new RequestEventEmitterServer(connection);
  console.log('Se ha conectado');

  serverEvent.on('request', (peticion) => {
    switch (peticion.type) {
      case 'add':
        const respuesta = notas.anadirNotas(peticion.usuario, peticion.titulo, peticion.contenido, peticion.color);
        connection.write(respuesta);
        break;

      case 'remove':
      connection.write(notas.eliminarNota(peticion.usuario, peticion.title));
      break;

      case 'list':
        connection.write(notas.listarNotas(peticion.usuario));
        break;

      case 'read':
        connection.write(notas.leerNotas(peticion.usuario, peticion.titulo));
        break;

      default:
        connection.write(notas.listarNotas(peticion.usuario));
        break;
    }
  });

  connection.on('close', () => {
    console.log('Un cliente se ha desconectado');
  });
});

server.listen(60300, () => {
  console.log('Esperando que se conecten al servidor');
});
```

Se crea el servidor  con el que se trabajará, luego se le pasa el puerto en el que el servidor debe de escuchar. Después de tener indicio de que la conexión 
se ha establecido correctamente, se llama a la clase ***RequestEventEmitterServer*** tras notificar al usuario de establecerse la conexion y de haber detectado el
evento.

# requestEventEmitterServer.ts

```
import {EventEmitter} from 'events';

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
```

En este fichero se realizan las gestiones referidas a los eventos del programa para emitir un evento al detectar que el usuario realiza una petición de manera
correcta.

# notasApp.ts y claseCliente.ts

Estos ficheros se han llevado a cabo para realizar de manera más sencilla las pruebas haciendo que se cree un nuevo evento con la respuesta del servidor
ya procesada







