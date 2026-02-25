import {Inngest} from "inngest";
export const inngest = new Inngest({
    id: "CarrerFlow",
    name:"CarrerFlow",
    credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});