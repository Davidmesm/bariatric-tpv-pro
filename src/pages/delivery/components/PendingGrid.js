import { Box, IconButton, Typography } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import { Input } from "@material-ui/icons";
import React from "react"

const PendingGrid = (props) => {
    const { data, clientData, productData, setOpenDialog, setValue, reset } = props

    const handleSendClick = (id) => {
        let delivery = data.find(delivery => delivery.id === id);

        reset()

        let index = 0
        let products = delivery.products.map(sp => {
            let product = productData.find(p => p.id === sp.productId)

            return { id: index++, product: product ? product.name : "error", flavour: sp.flavour ?? "", qty: sp.qty}
        })

        let client = clientData.find(client => client.id === delivery.clientId)
        let clientName = client ? `${client.firstName} ${client.lastName}` : "error"
        let phone = client ? client.phone : "error"

        setValue("id", delivery.id)
        setValue("saleId", delivery.saleId)
        setValue("saleDate", delivery.saleDate)
        setValue("address", delivery.address)
        setValue("products", products)
        setValue("client", clientName)
        setValue("phone", phone)

        setOpenDialog(true)
    }

    const getClient = (params) => {
        let client = clientData.find(item => item.id === params.row.clientId)

        return client ? `${client.firstName} ${client.lastName}` : ""
    }

    const getTaxRegistry = (params) => {
        let client = clientData.find(item => item.id === params.row.clientId)

        return client ? client.taxRegistry : ""
    }

    const getPhone = (params) => {
        let client = clientData.find(item => item.id === params.row.clientId)

        return client ? client.phone : ""
    }

    const columns = [
        {
            field: "id",
            headerName: " ",
            width: 80,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        aria-label="send"
                        onClick={() => handleSendClick(params.value)}
                        color="primary"
                    >
                        <Input />
                    </IconButton>
                </Box>
            )
        },
        { field: "saleId", headerName: "Id de Venta", width: 200 },
        { field: "saleDate", headerName: "Fecha de Venta", width: 180, type: "date" },
        {   
            field: "client",
            headerName: "Cliente",
            width: 300,
            valueGetter: getClient,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getClient(cellParam1).localeCompare(getClient(cellParam2))
        },
        {   
            field: "taxRegistry",
            headerName: "RFC",
            width: 200,
            valueGetter: getTaxRegistry,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getTaxRegistry(cellParam1).localeCompare(getTaxRegistry(cellParam2))
        },
        {
            field: "phone",
            headerName: "Teléfono",
            width: 180,
            valueGetter: getPhone,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getPhone(cellParam1).localeCompare(getPhone(cellParam2))
        },
        {
            field: "address",
            headerName: "Dirección",
            width: 250,
            renderCell: (params) => (
                <div>
                    <Typography variant="body2">{params.value.name}</Typography>
                    <Typography variant="body2">{`${params.value.street} ${params.value.extNumber} ${params.value.intRef && ` int ${params.value.intRef}`}`}</Typography>
                    <Typography variant="body2">{`${params.value.suburb}, ${params.value.zipCode}`}</Typography>
                    <Typography variant="body2">{`${params.value.city}, ${params.value.state}`}</Typography>
                    <Typography variant="body2">{`${params.value.comments}`}</Typography>
                </div>
            )
        }];


    return (
        <Box height="400px">
            <Box display="flex" height="100%">
                <Box flexGrow={1}>
                    <DataGrid
                        rows={data}
                        columns={columns}
                        rowHeight={100}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default PendingGrid
