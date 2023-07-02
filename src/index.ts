import { server } from "./lib/server.js";

export const init = () => {
    server.init();
}

export const app = {
    init,
};

export default app;

app.init();