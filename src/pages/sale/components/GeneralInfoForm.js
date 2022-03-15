import { Box, Grid, Paper } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import BooleanFieldInput from "../../../components/inputs/BooleanFieldInput"
import DateFieldInput from "../../../components/inputs/DateFieldInput"
import SelectFieldInput from "../../../components/inputs/SelectFieldInput"
import CurrencyFieldInput from "../../../components/inputs/CurrencyFieldInput"
import SelectedAddressForm from "./SelectedAddressForm"
import TextFieldInput from "../../../components/inputs/TextFieldInput"

const GeneralInfoForm = (props) => {

    const { vendorData, clientData, warehouseData } = props

    const [buyerData, setBuyerData] = useState([])
    const [vendorWarehouseData, setVendorWarehouseData] = useState([])
    const [addressOptions, setAddressOptions] = useState([])

    const methods = useFormContext()

    const { control, watch, setValue } = methods

    const watchClientId = watch("clientId")
    const watchVendorId = watch("vendorId")
    const watchAddressIndex = watch("addressIndex")

    useEffect(() => {
        if (watchClientId) {
            let result = []

            let currentClient = clientData.find(client => client.value === watchClientId.value)

            result.push(currentClient)

            let currDist

            if (currentClient.recommendedDistributorId) {
                currDist = clientData.find(client => client.value === currentClient.recommendedDistributorId)

                if (currDist) {
                    result.push(currDist)
                }
            }

            setBuyerData(result)

            let index = 0;
            let addresses = currentClient.addresses.map(address => {
                return { value: index++, label: address.name, render: address.name, ...address }
            })

            setAddressOptions(addresses)
        }
        else {
            setBuyerData([])
            setValue("buyerId", "")
        }
    }, [watchClientId, setBuyerData, clientData, setValue])

    useEffect(() => {
        if (watchClientId && buyerData.length > 0) {
            let currentClient = buyerData.find(client => client.value === watchClientId.value)

            if (currentClient) {
                if (currentClient.distributor) {
                    setValue("buyerId", watchClientId)
                    setValue("distributorId", watchClientId.label || "")
                }
                else if (currentClient.recommendedDistributorId) {
                    let currDist = buyerData.find(client => client.value === currentClient.recommendedDistributorId)
                    setValue("buyerId", watchClientId)
                    setValue("distributorId", currDist.label || "")
                }
                else {
                    setValue("buyerId", watchClientId)
                }
            }
        }

        if (watchClientId && (addressOptions.length > 0 && !watchAddressIndex)) {
            let address = addressOptions.find(a => a.value === watchClientId.mainAddress)

            if (address) {
                setValue("addressIndex", address)
            }
        }

    }, [watchClientId, buyerData, addressOptions, setValue])

    useEffect(() => {
        if (watchVendorId) {
            let warehouses = warehouseData.filter(w => {
                return w.vendors.includes(watchVendorId.value)
            })

            setVendorWarehouseData(warehouses)
        }
        else {
            setVendorWarehouseData([])
            setValue("warehouseId", "")
        }
    }, [watchVendorId, setVendorWarehouseData, warehouseData, setValue])

    useEffect(() => {
        let index = watchAddressIndex ? watchAddressIndex.value : 0

        if(addressOptions && addressOptions.length > index)
        {
            setValue("address", addressOptions[index])
        }
    }, [watchAddressIndex])

    return (
        <Box
            borderColor="primary.main"
            border={2}
            borderRadius={3}>
            <Box
                display="flex"
                flexDirection="column"
                padding={3}
                paddingBottom={4}>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    height="550px">
                    <Grid container spacing={1}>
                        <Grid item sm={6}>
                            <DateFieldInput
                                name="date"
                                label="Fecha"
                                control={control}
                                fullWidth />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item sm={6}>
                            <SelectFieldInput
                                name="clientId"
                                label="Cliente Final"
                                control={control}
                                setValue={setValue}
                                variant="outlined"
                                fullWidth
                                options={clientData} />
                        </Grid>
                        <Grid item sm={6}>
                            <SelectFieldInput
                                name="vendorId"
                                label="Atendio Venta"
                                control={control}
                                setValue={setValue}
                                variant="outlined"
                                fullWidth
                                options={vendorData} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item sm={6}>
                            <TextFieldInput
                                name="distributorId"
                                label="Distribuidor/Cliente Independiente"
                                disabled
                                control={control}
                                fullWidth />
                        </Grid>
                        <Grid item sm={6}>
                            <SelectFieldInput
                                name="buyerId"
                                label="Comprador"
                                control={control}
                                setValue={setValue}
                                variant="outlined"
                                fullWidth
                                options={buyerData} />
                        </Grid>
                        <Grid item sm={6}>
                            <SelectFieldInput
                                name="warehouseId"
                                label="Almacen"
                                control={control}
                                setValue={setValue}
                                variant="outlined"
                                fullWidth
                                options={vendorWarehouseData} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item sm={6}>
                            <BooleanFieldInput
                                name="hasChargeDelivery"
                                control={control}
                                label="Cobrar Envio" />
                        </Grid>
                        <Grid item sm={6}>
                            <CurrencyFieldInput
                                name={"deliveryCost"}
                                label="Costo Envio"
                                fullWidth
                                control={control} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item sm={6}>
                            <Box width="100%"
                                display="flex"
                                flexDirection="column"
                                justifyContent="space-betwee">
                                <BooleanFieldInput
                                    name="delivered"
                                    control={control}
                                    label="Entregado" />
                                <br />
                                <SelectFieldInput
                                    name="addressIndex"
                                    label="Dirección"
                                    control={control}
                                    setValue={setValue}
                                    variant="outlined"
                                    fullWidth
                                    options={addressOptions} />
                            </Box>
                        </Grid>
                        <Grid item sm={6}>
                            <Paper elevation={1}>
                                <Box padding={3} minHeight="120px">
                                    <SelectedAddressForm conrol={control} />
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    )
}

export default GeneralInfoForm
