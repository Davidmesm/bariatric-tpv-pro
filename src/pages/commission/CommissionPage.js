import { Box, Container, Grid } from "@material-ui/core"
import React from "react"
import { Switch, useRouteMatch } from "react-router"
import PrivateRoute from "../../components/PrivateRoute"
import CommissionMenu from "./components/CommissionMenu"
import DistributorCommission from "./pages/DistributorCommission"
import VendorCommission from "./pages/VendorCommission"

const CommissionPage = () => {
    let { path } = useRouteMatch()

    return (
        <Box paddingTop="67px" width='100%'>
            <Container>
                <Grid container spacing={4}>
                    <Grid item sm={3}>
                        <CommissionMenu />
                    </Grid>
                    <Grid item sm={9}>
                    <Box
                            borderColor="primary.main"
                            border={3}
                            borderRadius={3}
                            paddingLeft={2}
                            paddingRight={2}
                            marginTop={3}
                            height={600}>
                                <Switch>
                                <PrivateRoute
                                    exact
                                    path={`${path}/vendor`}
                                    component={VendorCommission} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/distributor`}
                                    component={DistributorCommission} />
                                </Switch>
                            </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}

export default CommissionPage
