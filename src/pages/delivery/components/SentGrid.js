import { Box, IconButton, Typography } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import { Input, SettingsBackupRestore } from "@material-ui/icons";
import React from "react"

const SentGrid = (props) => {
    const { data, 
        clientData, 
        setOpenDialogRecieve, 
        setIdToRecieve, 
        setOpenDialogReturn, 
        setIdToReturn,
        parcelServiceData } = props

    const handleRecieveClick = (id) => {
        setIdToRecieve(id)

        setOpenDialogRecieve(true)
    }

    const handleReturnClick = (id) => {
        setIdToReturn(id)

        setOpenDialogReturn(true)
    }

    const getClient = (params) => {
        let client = clientData.find(item => item.id === params.row.clientId)

        return client ? `${client.firstName} ${client.lastName}` : ""
    }

    const getPhone = (params) => {
        let client = clientData.find(item => item.id === params.row.clientId)

        return client ? client.phone : ""
    }

    const getParcelService = (params) => {
        if(!params || !params.row)
            return ""


        if(!params.row.parcelService)
            return ""

        let service = parcelServiceData.find(item => item.value === params.row.parcelService)

        return service ? service.label : ""
    }

    const columns = [
        {
            field: "id",
            headerName: " ",
            width: 160,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        aria-label="send"
                        onClick={() => handleRecieveClick(params.value)}
                        color="primary"
                    >
                        <Input />
                    </IconButton>
                    <IconButton
                        aria-label="send"
                        onClick={() => handleReturnClick(params.value)}
                        color="primary"
                    >
                        <SettingsBackupRestore />
                    </IconButton>
                </Box>
            )
        },
        { field: "saleId", headerName: "Id de Venta", width: 200 },
        { field: "sendDate", headerName: "Fecha de Envio", width: 180, type: "date" },
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
        {
            field: "parcelService",
            headerName: "Servicio de Paquetería",
            width: 230,
            valueGetter: getParcelService,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
            getParcelService(cellParam1).localeCompare(getParcelService(cellParam2))
        },
        { field: "trackingGuide", headerName: "Guía de Rastreo", width: 300}];


    return (
        <Box height="400px">
            <Box display="flex" height="100%">
                <Box flexGrow={1}>
                    <DataGrid
                        rows={data}
                        columns={columns}
                        //sortModel={sortModel}
                        //onSortModelChange={(model) => setSortModel(model)}
                        rowHeight={100}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default SentGrid
