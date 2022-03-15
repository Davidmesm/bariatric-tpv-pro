import { Box, List } from "@material-ui/core"
import CatalogMenuItem from "./CatalogMenuItem"
import React from "react"
import { useRouteMatch } from "react-router";

const CatalogMenu = () => {

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
                    <CatalogMenuItem 
                        title="Canales de Contacto"
                        link={`${url}/contact-channel`}
                        label="contactChannel"/>
                    <CatalogMenuItem 
                        title="Tipos de Precio"
                        link={`${url}/price-type`}
                        label="priceType"/>
                    <CatalogMenuItem 
                        title="Bancos"
                        link={`${url}/bank`}
                        label="bank"/>
                    <CatalogMenuItem 
                        title="Cuentas de Banco"
                        link={`${url}/bank-account`}
                        label="bankAccount"/>
                    <CatalogMenuItem 
                        title="Formas de Pago"
                        link={`${url}/payment-type`}
                        label="paymentType"/>
                    <CatalogMenuItem 
                        title="Nutriólogos o Grupos"
                        link={`${url}/nutritionist`}
                        label="nutritionist"/>
                    <CatalogMenuItem 
                        title="Cirugias"
                        link={`${url}/surgery`}
                        label="surgery"/>
                </List>
            </Box>
    )
}

export default CatalogMenu
