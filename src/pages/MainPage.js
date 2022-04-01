import React from "react"
import { Switch } from "react-router"
import AppLayout from "../components/AppLayout"
import PrivateRoute from "../components/PrivateRoute"
import ClientPage from "./client/ClientPage"
import ClientAddPage from "./client/ClientAddPage"
import ClientEditPage from "./client/ClientEditPage"
import DashboardPage from "./dashboard/DashboardPage"
import CatalogListPage from "./catalog/CatalogListPage"
import VendorPage from "./vendor/VendorPage"
import VendorAddPage from "./vendor/VendorAddPage"
import VendorEditPage from "./vendor/VendorEditPage"
import ProductPage from "./product/ProductPage"
import ProductAddPage from "./product/ProductAddPage"
import ProductEditPage from "./product/ProductEditPage"
import InventoryPage from "./inventory/InventoryPage"
import WarehouseAddPage from "./inventory/WarehouseAddPage"
import WarehouseEditPage from "./inventory/WarehouseEditPage"
import InventoryAddPage from "./inventory/InventoryAddPage"
import InventoryEditPage from "./inventory/InventoryEditPage"
import SalePage from "./sale/SalePage"
import SaleAddPage from "./sale/SaleAddPage"
import SaleEditPage from "./sale/SaleEditPage"
import CommissionPage from "./commission/CommissionPage"
import DeliveryPage from "./delivery/DeliveryPage"
import DeveloperPage from "./developer/DeveloperPage"

const MainPage = () => {

    return (
        <AppLayout>
            <Switch>
                <PrivateRoute exact path={"/"} component={DashboardPage} />
                <PrivateRoute exact path={"/client"} component={ClientPage} />
                <PrivateRoute path={"/client/add"} component={ClientAddPage} />
                <PrivateRoute path={"/client/edit/:id"} component={ClientEditPage} />
                <PrivateRoute exact path={"/sale"} component={SalePage} />
                <PrivateRoute path={"/sale/add"} component={SaleAddPage} />
                <PrivateRoute path={"/sale/edit/:id"} component={SaleEditPage} />
                <PrivateRoute exact path={"/vendor"} component={VendorPage} />
                <PrivateRoute exact path={"/vendor/add"} component={VendorAddPage} />
                <PrivateRoute exact path={"/vendor/edit/:id"} component={VendorEditPage} />
                <PrivateRoute exact path={"/product"} component={ProductPage} />
                <PrivateRoute exact path={"/product/add"} component={ProductAddPage} />
                <PrivateRoute exact path={"/product/edit/:id"} component={ProductEditPage} />
                <PrivateRoute exact path={"/inventory"} component={InventoryPage} />
                <PrivateRoute exact path={"/inventory/warehouse/add"} component={WarehouseAddPage} />
                <PrivateRoute exact path={"/inventory/warehouse/edit/:id"} component={WarehouseEditPage} />
                <PrivateRoute exact path={"/inventory/warehouse/:id/buy"} component={InventoryAddPage} />
                <PrivateRoute exact path={"/inventory/warehouse/:id/buy/edit/:buyId"} component={InventoryEditPage} />
                <PrivateRoute path={"/catalog"} component={CatalogListPage} />
                <PrivateRoute path={"/commission"} component={CommissionPage} />
                <PrivateRoute exact path={"/delivery"} component={DeliveryPage} />
                <PrivateRoute exact path={"/developer"} component={DeveloperPage} />
            </Switch>
        </AppLayout>
    )
}

export default MainPage
