import {SlashCommand} from "../modules/Types"
import help from "./help"
import e6login from "./e6login"
import e621 from "./e621"
import e6logout from "./e6logout"

const commands: Array<SlashCommand> = [
    help,
    e6login,
    e621,
    e6logout
]

export default commands