/**
 * ALPAR AI Otonom Cron Motoru (Forwarder to .cjs)
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require("./alpar_cron.cjs");
