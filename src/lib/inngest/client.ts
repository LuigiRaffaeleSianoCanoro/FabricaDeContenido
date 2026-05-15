import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "fabrica-de-contenido",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
