import Elysia, { t } from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import { getCount, updateCount } from "./utils/database";

const clients: { [key: string]: { ws: ElysiaWS, ip: string } } = {};

export default new Elysia({ prefix: "/websocket", websocket: { idleTimeout: 20 * 60 } })
    .ws("/", {
        open(ws) {
            const client = clients[ws.id] = {
                ws,
                ip: ws.data.headers["x-forwarded-for"] ?? ws.remoteAddress
            };

            console.log(`${client.ip} connected to the websocket. (Current connections: ${Object.keys(clients).length})`);

            ws.send(`blahaj_${getCount()}_1`);

            if (isGoalReached()) return ws.send(`show_${btoa(process.env.GOAL_IMAGE_URL!)}`);
        },
        message(ws) {
            ws.send("pong");
        },
        close(ws) {
            const client = clients[ws.id];
            console.log(`${client.ip} disconnected from the websocket. (Current connections: ${Object.keys(clients).length})`);
            delete clients[ws.id];
        }
    })
    .post("/click", async ({ headers, server, body }) => {
        let count = getCount() + 1;
        updateCount(count);
        server!.publish("blahaj", `blahaj_${count}_${body.uuid}`);

        if (isGoalReached()) return server!.publish("blahaj", `show_${btoa(process.env.GOAL_IMAGE_URL!)}`);

        return { ok: true }
    }, {
        body: t.Object({
            uuid: t.String()
        })
    })

function isGoalReached(): boolean {
    let count = getCount();
    return count >= Number(process.env.GOAL!);
}
