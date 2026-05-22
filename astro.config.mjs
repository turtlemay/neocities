// @ts-check

import { defineConfig, fontProviders } from "astro/config";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import { dataFetcher } from "./entries/integration.ts";

export default defineConfig({
    integrations: [vue(), mdx(), dataFetcher()],
    fonts: [
        {
            name: "Pixel Operator",
            cssVariable: "--font-pixel-operator",
            provider: fontProviders.local(),
            options: {
                variants: [
                    {
                        src: ["./assets/fonts/pixel_operator/PixelOperator.ttf"],
                        weight: "normal",
                        style: "normal",
                    },
                    {
                        src: ["./assets/fonts/pixel_operator/PixelOperator-Bold.ttf"],
                        weight: "bold",
                        style: "normal",
                    },
                ],
            },
        },
    ],
    server: { host: true },
});
