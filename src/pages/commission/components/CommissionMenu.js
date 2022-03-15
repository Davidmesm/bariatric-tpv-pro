import { Box, List } from "@material-ui/core"
import CommisionMenuItem from "./CommissionMenuItem"
import React from "react"
import { useRouteMatch } from "react-router";
const CommissionMenu = () => {
    let { url } = useRouteMatch();

    return (
        <Box
            borderColor="primary.main"
            border={3}
            borderRadius={3}
            padding={3}
            marginTop={3}
            minHeight={600}>
            <List>
                <CommisionMenuItem
                    title="Vendedor"
                    link={`${url}/vendor`}
                    label="vendor" />
                <CommisionMenuItem
                    title="Distribuidor"
                    link={`${url}/distributor`}
                    label="distributor" />
            </List>
        </Box>
    )
}

export default CommissionMenu
