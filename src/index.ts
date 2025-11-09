import html from "@elysiajs/html";
import { Elysia } from "elysia";
import { render } from "./utils/render";
import staticPlugin from "@elysiajs/static";
import websocket from "./websocket";
import { getCount } from "./utils/database";
import cors from "@elysiajs/cors";

const app = new Elysia()
    .use(html())
    .use(cors({
        methods: ["GET"]
    }))
    .use(staticPlugin())
    .use(staticPlugin({ prefix: "/lucide", assets: "node_modules/lucide-static/icons" }))
    .onAfterHandle(async ({ path, query, set }) => {
        if (path.startsWith("/lucide/") && query.color) {
            let file = Bun.file(path.replace("/lucide", "node_modules/lucide-static/icons"));
            let content = await file.text();
            content = content.replaceAll("currentColor", query.color);
            set.headers["content-type"] = "image/svg+xml";
            return new Response(content);
        }
    })
    .get("/", () => render("index"))
    .get("/blahaj", () => {
        let count = getCount()
        return {
            count
        }
    })
    .use(websocket)
    .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
