import click from "./fun/click";
import help from "./info/help";
import ping from "./fun/ping";
import eval from "./owner/eval";
import changenick from "./moderation/changenick";
import prefix from "./settings/prefix";
import acronym from "./fun/acronym";

export default [
    help,
    click,
    ping,
    eval,
    changenick,
    prefix,
    acronym
];