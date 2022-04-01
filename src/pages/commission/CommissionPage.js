import { Box, Container, Grid } from "@material-ui/core"
import React from "react"
import { Switch, useRouteMatch } from "react-router"
import PrivateRoute from "../../components/PrivateRoute"
import CommissionMenu from "./components/CommissionMenu"
import DistributorCommission from "./pages/DistributorCommission"
import DistributorCommissionAddPage from "./pages/DistributorCommissionAddPage"
import DistributorCommissionEditPage from "./pages/DistributorCommissionEditPage"
import VendorCommission from "./pages/VendorCommission"
import VendorCommissionAddPage from "./pages/VendorCommissionAddPage"
import VendorCommissionEditPage from "./pages/VendorCommissionEditPage"

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
                                <PrivateRoute
                                    exact
                                    path={`${path}/vendor/add`}
                                    component={VendorCommissionAddPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/vendor/edit/:id`}
                                    component={VendorCommissionEditPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/distributor/edit/:id`}
                                    component={DistributorCommissionEditPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/distributor/add`}
                                    component={DistributorCommissionAddPage} />
                                </Switch>
                            </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}

export default CommissionPage
