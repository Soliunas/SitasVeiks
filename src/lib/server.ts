import http, { IncomingMessage, ServerResponse } from 'node:http';
import { file } from './file.js';

type Server = {
    init: () => void;
    httpServer: any;
}

const server = {} as Server;

server.httpServer = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const socket = req.socket as any;
    const encryption = socket.encryption as any;
    const ssl = encryption !== undefined ? 's' : '';

    const baseURL = `http${ssl}://${req.headers.host}`;
    const parsedURL = new URL(req.url ?? '', baseURL);
    const httpMethod = req.method ? req.method.toLowerCase() : 'get';
    const trimmedPath = parsedURL.pathname
        .replace(/^\/+|\/+$/g, '')
        .replace(/\/\/+/g, '/');

    const textFileExtensions = ['css', 'js', 'svg', 'webmanifest'];
    const binaryFileExtensions = ['png', 'jpg', 'jpeg', 'webp', 'ico', 'eot', 'ttf', 'woff', 'woff2', 'otf'];
    const fileExtension = trimmedPath.slice(trimmedPath.lastIndexOf('.') + 1);
    
    const isTextFile = textFileExtensions.includes(fileExtension);
    const isBinaryFile = binaryFileExtensions.includes(fileExtension);
    const isAPI = trimmedPath.startsWith('api/');           
    const isPage = !isTextFile && !isBinaryFile && !isAPI;

    type Mimes = Record<string, string>;

        const MIMES: Mimes = {
            html: 'text/html',
            js: 'text/javascript',
            json: 'application/json',
            txt: 'text/plain',
            webmanifest: 'application/manifest+json',
        };

    let responseContent = 'ERROR: neturiu tai ko tu nori...';;
    
    if (isTextFile) {
        responseContent = 'TEKSTINIS FAILAS';
    }

    if (isBinaryFile) {
        responseContent = 'BINARY FAILAS';
    }

    if (isAPI) {
        const content = `{
            "id": 22,
            "name": "Jonas",
            "email": "jonas@juozapaitis.lt",
            "password": 4321
        }`;
        const [err, msg] = await file.create('../data', 'jonas@juozapaitis.lt.json', content);
        if (err) {
            responseContent = msg;
        } else {
            responseContent = content;
        }
    }

    if (isAPI) {
        const content = `{
            "id": 11,
            "name": "Maryte",
            "email": "maryte@mariauskiate.lt",
            "password": 1122
        }`;
        const [err, msg] = await file.create('../data', 'maryte@mariauskiate.lt.json', content);
        if (err) {
            responseContent = msg;
        } else {
            responseContent = content;
        }
    }

    if (isAPI) {
        const content = `{
            "id": 33,
            "name": "Petras",
            "email": "petras@petraitis.lt",
            "password": 1234
        }`;
        const [err, msg] = await file.create('../data', 'petras@petraitis.lt.json', content);
        if (err) {
            responseContent = msg;
        } else {
            responseContent = content;
        }
    }

    if (isAPI) {
        const content = `{
            "id": 11,
            "name": "Maryte",
            "email": "maryte@mariauskaite.lt",
            "password": 1122
        }`;
        const [err, msg] = await file.delete('../data', 'maryte@mariauskaite.lt.json');
        if (err) {
            responseContent = msg;
        } else {
            responseContent = content;
        }
    }

    if (isAPI) {

        const content = `{
            "id": 22,
            "name": "Jonas",
            "email": "jonas@juozapaitis.lt",
            "password": 4321
        }`;

        const [err, msg] = await file.update('../data', 'jonas@juozapaitis.lt.json', content);
        if (err) {
            responseContent = msg;
        } else {
            responseContent = content;
        }
    }

    if (isAPI) {
        const content = `{
            "id": 33,
            "name": "Petras",
            "email": "petras@petraitis.lt",
            "password": 1234
        }`;
        const [err, msg] = await file.update('../data', 'petras@petraitis.lt.json', content);
        if (err) {
            responseContent = msg;
        } else {
            responseContent = content;
        }
    }

    if (isPage) {
        responseContent = `LABAI GERA SVETAINĖ`;
    }

    return res.end(responseContent);
});

server.init = () => {
    server.httpServer.listen(3016, () => {
        console.log('Serveris sukasi ant http://localhost:3016');
    });
};

export { server };