import { Box, Typography } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React from "react"


const DeliveredGrid = (props) => {
    const { data, clientData } = props

    const getClient = (params) => {
        let client = clientData.find(item => item.id === params.row.clientId)

        return client ? `${client.firstName} ${client.lastName}` : ""
    }

    const getPhone = (params) => {
        let client = clientData.find(item => item.id === params.row.clientId)

        return client ? client.phone : ""
    }

    const columns = [
        { field: "saleId", headerName: "Id de Venta", width: 200 },
        { field: "recievedDate", headerName: "Fecha de Entrega", width: 210, type: "date" },
        {
            field: "client",
            headerName: "Cliente",
            width: 300,
            valueGetter: getClient,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getClient(cellParam1).localeCompare(getClient(cellParam2))
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
        },
        { field: "parcelService", headerName: "Servicio de Paquetería", width: 230 },
        { field: "trackingGuide", headerName: "Guía de Rastreo", width: 300 }];

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

export default DeliveredGrid
