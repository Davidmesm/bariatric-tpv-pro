import { Box, Container, Grid } from "@material-ui/core"
import React from "react"
import { Switch, useRouteMatch } from "react-router"
import PrivateRoute from "../../components/PrivateRoute"
import CatalogMenu from "./components/CatalogMenu"
import ContactChannelPage from "./pages/contactChannel/ContactChannelPage"
import ContactChannelAddPage from "./pages/contactChannel/ContactChannelAddPage"
import ContactChannelEditPage from "./pages/contactChannel/ContactChannelEditPage"
import PriceTypePage from "./pages/priceType/PriceTypePage"
import PriceTypeAddPage from "./pages/priceType/PriceTypeAddPage"
import PriceTypeEditPage from "./pages/priceType/PriceTypeEditPage"
import BankPage from "./pages/bank/BankPage"
import BankAddPage from "./pages/bank/BankAddPage"
import BankEditPage from "./pages/bank/BankEditPage"
import BankAccountPage from "./pages/bankAccount/BankAccountPage"
import BankAccountAddPage from "./pages/bankAccount/BankAccountAddPage"
import BankAccountEditPage from "./pages/bankAccount/BankAccountEditPage"
import PaymentTypePage from "./pages/paymentType/PaymentTypePage"
import PaymentTypeAddPage from "./pages/paymentType/PaymentTypeAddPage"
import PaymentTypeEditPage from "./pages/paymentType/PaymentTypeEditPage"
import NutritionistPage from "./pages/nutritionist/NutritionistPage"
import NutritionistAddPage from "./pages/nutritionist/NutritionistAddPage"
import NutritionistEditPage from "./pages/nutritionist/NutritionistEditPage"
import SurgeryPage from "./pages/surgery/SurgeryPage"
import SurgeryAddPage from "./pages/surgery/SurgeryAddPage"
import SurgeryEditPage from "./pages/surgery/SurgeryEditPage"
import ParcelServicePage from "./pages/parcelService/ParcelServicePage"
import ParcelServiceEditPage from "./pages/parcelService/ParcelServiceEditPage"
import ParcelServiceAddPage from "./pages/parcelService/ParcelServiceAddPage"

const CatalogListPage = () => {

    let { path } = useRouteMatch()

    return (
        <Box paddingTop="67px" width='100%'>
            <Container>
                <Grid container spacing={4}>
                    <Grid item sm={3}>
                        <CatalogMenu />
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
                                    path={`${path}/contact-channel`}
                                    component={ContactChannelPage} />
                                <PrivateRoute
                                    path={`${path}/contact-channel/add`}
                                    component={ContactChannelAddPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/contact-channel/edit/:id`}
                                    component={ContactChannelEditPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/price-type`}
                                    component={PriceTypePage} />
                                <PrivateRoute
                                    path={`${path}/price-type/add`}
                                    component={PriceTypeAddPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/price-type/edit/:id`}
                                    component={PriceTypeEditPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/bank`}
                                    component={BankPage} />
                                <PrivateRoute
                                    path={`${path}/bank/add`}
                                    component={BankAddPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/bank/edit/:id`}
                                    component={BankEditPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/bank-account`}
                                    component={BankAccountPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/bank-account/add`}
                                    component={BankAccountAddPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/bank-account/edit/:id`}
                                    component={BankAccountEditPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/payment-type`}
                                    component={PaymentTypePage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/payment-type/add`}
                                    component={PaymentTypeAddPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/payment-type/edit/:id`}
                                    component={PaymentTypeEditPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/nutritionist`}
                                    component={NutritionistPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/nutritionist/add`}
                                    component={NutritionistAddPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/nutritionist/edit/:id`}
                                    component={NutritionistEditPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/surgery`}
                                    component={SurgeryPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/surgery/add`}
                                    component={SurgeryAddPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/surgery/edit/:id`}
                                    component={SurgeryEditPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/parcelService/edit/:id`}
                                    component={ParcelServiceEditPage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/parcelService/`}
                                    component={ParcelServicePage} />
                                <PrivateRoute
                                    exact
                                    path={`${path}/parcelService/add`}
                                    component={ParcelServiceAddPage} />
                            </Switch>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}

export default CatalogListPage
