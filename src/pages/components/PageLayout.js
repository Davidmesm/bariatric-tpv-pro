import { Box, Container } from "@material-ui/core"
import React from "react"
import PageToolBar from "./PageToolBar"

const PageLayout = (props) => {

    const {title, disableAddButton, data, headers, addFunction} = props

    return (
        <Box paddingTop="67px" width="100%">
            <Container>
                <PageToolBar 
                    title={title}
                    disableAddButton={disableAddButton}
                    data={data}
                    headers={headers}
                    addFunction={addFunction}/>
                {props.children}
            </Container>
        </Box>
    )
}

export default PageLayout
