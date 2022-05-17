import {SlashCommand} from "../modules/Types"
import help from "./help"
import e6login from "./e6login"
import e621 from "./e621"

const commands: Array<SlashCommand> = [
    help,
    e6login,
    e621
]

export default commands