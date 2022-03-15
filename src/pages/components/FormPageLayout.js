import { Box, Container, Typography } from "@material-ui/core"
import React from "react"

const FormPageLayout = (props) => {

    const { title, children } = props

    return (
        <Box paddingTop="67px" width="100%">
            <Container>
                <Box paddingTop={3}>
                    <Typography variant="h5">
                        {title}
                    </Typography>
                    <br />
                    {children}
                </Box>
            </Container>
        </Box>
    )
}

export default FormPageLayout
