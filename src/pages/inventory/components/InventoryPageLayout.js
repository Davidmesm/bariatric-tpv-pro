import { Box, Container } from "@material-ui/core"
import React from "react"
import InventoryToolBar from "./InventoryToolBar"

const InventoryPageLayout = (props) => {
    return (
        <Box paddingTop="67px" width='100%'>
            <Container>
                <InventoryToolBar {...props}/>
                {props.children}
            </Container>
        </Box>
    )
}

export default InventoryPageLayout
