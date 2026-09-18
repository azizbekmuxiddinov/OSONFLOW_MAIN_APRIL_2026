import { defineConfig } from "vite";
import { resolve } from "path";
import { prototype } from "events";

export default defineConfig({
    build: {
        // Built straight into the file the widget app serves at /widget.js.
        // A separate dist/ output had to be copied over by hand, and a missed
        // copy left customer sites running a months-old launcher.
        outDir: resolve(__dirname, "../widget/public"),
        // The widget app's public/ holds other assets; never wipe it.
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, "embed.ts"),
            name: "EchoWidget",
            fileName: () => "widget.js",
            formats: ["iife"],
        },
        rollupOptions: {
            output: {
                extend: true,
            },
        },
    },

    server: {
        port: 3002,
        open: "/demo.html"
    }
});