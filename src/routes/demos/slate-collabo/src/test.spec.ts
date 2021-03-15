import { transform } from "./transform"
import "jest"

describe("operation transform", () => {
    console.log(
        transform(
            {
                type: "remove_node",
                path: [0, 0],
                node: {
                    text: "1",
                },
            },
            {
                type: "move_node",
                path: [0, 0, 1],
                newPath: [0, 1, 1],
            }
        )
    )
})
