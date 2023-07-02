import http, { IncomingMessage, ServerResponse } from 'node:http';
import { file } from './file.js';
import { StringDecoder } from 'node:string_decoder';

const validatedUserData = (data: any) => {
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    throw new Error('No name provided');
  }
  if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
    throw new Error('No email provided');
  }
  if (!data.email.includes('@')) {
    throw new Error('Invalid email format');
  }
  if (!data.password || typeof data.password !== 'string' || data.password.trim() === '') {
    throw new Error('No password provided');
  }
  if (data.password.length < 8) {
    throw new Error('Password must contain at least 8 characters long');
  }
  if (!/[a-zA-Z]/.test(data.password)) {
    throw new Error('Password must contain at least one letter');
  }
};

// const getUserByEmail = async (email: string) => {
//     const [err, user] = await file.read('users', `${email}.json`);
//     if (err) {
//         return null;
//     }
//     return { name: user.name, email: user.email };
// };

export const serverLogic = async (req: IncomingMessage, res: ServerResponse) => {
    const baseUrl = `http://${req.headers.host}`;
    const parsedUrl = new URL(req.url ?? '', baseUrl);
    const trimmedPath = parsedUrl.pathname
        .replace(/^\/+|\/+$/g, '')
        .replace(/\/+/g, '/');

    const textFileExtensions = ['css', 'js'];
    const binaryFileExtensions = ['png', 'jpg', 'ico', 'webp', 'jpeg'];
    const extension = (trimmedPath.includes('.') ? trimmedPath.split('.').at(-1) : '') as string;


    const isTextFile = textFileExtensions.includes(extension);
    const isBinaryFile = binaryFileExtensions.includes(extension);
    const isApi = trimmedPath.startsWith('api/');
    const isPage = !isTextFile && !isBinaryFile && !isApi;
    
    type Mimes = Record<string, string>;
    const MIMES: Mimes = {
        html: 'text/html',
        css: 'text/css',
        js: 'text/javascript',
        json: 'application/json',
        txt: 'text/plain',
        svg: 'image/svg+xml',
        xml: 'application/xml',
        ico: 'image/vnd.microsoft.icon',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        woff2: 'font/woff2',
        woff: 'font/woff',
        ttf: 'font/ttf',
        gif: 'image/gif',
        webmanifest: 'application/manifest+json',
    };

    let responseContent: string | Buffer = '';
    let buffer = '';
    const stringDecoder = new StringDecoder('utf-8');

    req.on('data', (data) => {
        buffer += stringDecoder.write(data);
    });

    req.on('end', async () => {
        buffer += stringDecoder.end();
        
        if (isTextFile) {
            const [err, msg] = await file.readPublic(trimmedPath);
    
            if (err) {
                res.statusCode = 404;
                responseContent = `Error: could not find file: ${trimmedPath}`;
            } else {
                res.writeHead(200, {
                    'Content-Type': MIMES[extension],
                })
                responseContent = msg;
            }
        }
    
        if (isBinaryFile) {const [err, msg] = await file.readPublicBinary(trimmedPath);
    
            if (err) {
                res.statusCode = 404;
                responseContent = `Error: could not find file: ${trimmedPath}`;
            } else {
                res.writeHead(200, {
                    'Content-Type': MIMES[extension],
                })
                responseContent = msg;
            }
        }
    
        if (isApi) {
            const jsonData = buffer ? JSON.parse(buffer) : {};

            try {
                validatedUserData(jsonData);
            } catch (error: any) {
                res.statusCode = 400;
                responseContent = error.message as string;
                res.end(responseContent);
                return;
            }
            // if (trimmedPath === 'api/users' && req.method === 'GET') {
            //     const email = parsedUrl.searchParams.get('email');

            //     if (!email) {
            //         res.statusCode = 400;
            //         responseContent = 'Email parameter is missing';
            //         res.end(responseContent);
            //         return;
            //     }

            //     try {
            //         const user = await getUserByEmail(email);
            //         if (user) {
            //             responseContent = JSON.stringify(user);
            //         } else {
            //             responseContent = 'User not found';
            //         }
            //     } catch (error: any) {
            //         responseContent = error.message;
            //         res.statusCode = 500;
            //     }
            // } else {
            //     const jsonData = buffer ? JSON.parse(buffer) : {};

            //     try {
            //         validatedUserData(jsonData);
            //     } catch (error: any) {
            //         res.statusCode = 400;
            //         responseContent = error.message as string;
            //         res.end(responseContent);
            //         return;
            //     }
            // }
        
            if (req.method === 'POST') {
                const [err] = await file.create('users', jsonData.email + '.json', jsonData);
                if (err) {
                    responseContent = 'User already exists, dublicate email';
                    // responseContent = msg.toString();
                } else {
                    responseContent = 'User Created';
                }
            } else if (req.method === 'GET') {
                 const [err, msg] = await file.read('users', jsonData.email + '.json');
                if (err) {
                    responseContent = msg.toString();
                } else {
                    responseContent = jsonData;
                }
                // try {
                //     const user = await getUserByEmail(jsonData.email);
                //     if (user) {
                //         responseContent = JSON.stringify(user);
                //     } else {
                //         responseContent = 'User not found';
                //     }                 
                // } catch (error: any) {
                //     responseContent = error.message;
                //     res.statusCode = 500;
                // }
            } else if (req.method === 'PUT') {
                const [err, msg] = await file.update('users', jsonData.email + '.json', jsonData);
                if (err) {
                    responseContent = msg.toString();
                } else {
                    responseContent = 'User Updated';
                }
            } else if (req.method === 'DELETE') {
                const [err, msg] = await file.delete('users', jsonData.email + '.json');
                if (err) {
                    responseContent = msg.toString();
                } else {
                    responseContent = 'User Deleted';
                }
            }
        }
    
        if (isPage) {
            res.writeHead(200, {
                'Content-Type': MIMES.html,
            });
            responseContent = 'PAGE CONTENT';
        }
    
        res.end(responseContent);
    });
};

export const httpServer = http.createServer(serverLogic);

export const init = () => {
    httpServer.listen(3016, () => {
        console.log(`Server running at http://localhost:3016`);    
    })
    
}

export const server = {
    init,
    httpServer,
};

export default server;