import Elysia, { t } from "elysia";
import { getCount, updateCount } from "./utils/database";

export default new Elysia({ prefix: "/websocket", websocket: { idleTimeout: 20 * 60 } })
    .ws("/", {
        open(ws) {
            ws.subscribe("blahaj")
            ws.send(`blahaj_${getCount()}_1`);

            if (isGoalReached()) return ws.send(`show_${btoa(process.env.GOAL_IMAGE_URL!)}`);
        },
        message(ws) {
            ws.send("pong");
        },
        close(ws) {
            ws.unsubscribe("blahaj");
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
