import { Box, Grid, IconButton, Typography } from "@material-ui/core"
import React from "react"
import VendorList from "./VendorList"
import { ChevronLeft, ChevronRight } from "@material-ui/icons"

const VendorAssignmentForm = (props) => {

    const { vendorData, setVendorData, warehouseVendorData,
        setWarehouseVendorData } = props

    const handleRightClick = () => {
        let vData = []
        let wVData = [...warehouseVendorData]

        vendorData.forEach(vendor => {
            if(vendor.checked)
            {
                wVData.push(vendor)
            }
            else
            {
                vData.push(vendor)
            }
        })

        setVendorData(vData)
        setWarehouseVendorData(wVData)
    }

    const handleLeftClick = () => {
        let vData = [...vendorData]
        let wVData = []

        warehouseVendorData.forEach(vendor => {
            if(vendor.checked)
            {
                vData.push(vendor)
            }
            else
            {
                wVData.push(vendor)
            }
        })

        setVendorData(vData)
        setWarehouseVendorData(wVData)
    }

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item sm={5}>
                    <Box
                        height="400px"
                        padding={3}
                        borderColor="primary.main"
                        border={2}
                        display="flex"
                        flexDirection="column">
                        <Typography variant="h6">
                            Vendedores
                        </Typography>
                        <VendorList
                            vendorList={vendorData}
                            setVendorList={setVendorData} />
                    </Box>
                </Grid>
                <Grid item sm={2}>
                    <Box
                        height="400px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center">
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            flexDirection="column"
                            height="80px">
                            <IconButton
                                color="secondary"
                                aria-label="right"
                                component="span"
                                onClick={() => handleRightClick()}>
                                <ChevronRight />
                            </IconButton>
                            <IconButton
                                color="secondary"
                                aria-label="right"
                                component="span"
                                onClick={() => handleLeftClick()}>
                                <ChevronLeft />
                            </IconButton>
                        </Box>
                    </Box>
                </Grid>
                <Grid item sm={5}>
                    <Box
                        height="400px"
                        padding={3}
                        borderColor="primary.main"
                        border={2}
                        display="flex"
                        flexDirection="column">
                        <Typography variant="h6">
                            Vendedores del Almacen
                        </Typography>
                        <VendorList
                            vendorList={warehouseVendorData}
                            setVendorList={setWarehouseVendorData} />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default VendorAssignmentForm
