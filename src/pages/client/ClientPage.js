import { Box, IconButton } from "@material-ui/core"
import { Delete, Edit, Visibility } from "@material-ui/icons"
import React, { useEffect, useState } from "react"
import { DataGrid } from '@material-ui/data-grid';
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import { useHistory, useRouteMatch } from "react-router"
import { useAlerts } from "../../contexts/AlertsContext"
import { db } from "../../firebase"
import PageLayout from "../components/PageLayout"
import DeleteDialog from "../../components/dialogs/DeleteDialog"
import AddressViewDialog from "../components/address/AddressViewDialog"
import Loading from "../../components/Loading";
import { useClient } from "../../contexts/ClientContext";

const ClientPage = () => {

    const history = useHistory()
    let { url } = useRouteMatch()
    const { promiseInProgress } = usePromiseTracker()
    const { createAlert } = useAlerts()
    const { clientData } = useClient()

    const [contactChannelData, setContactChannelData] = useState([])
    const [priceTypeData, setPriceTypeData] = useState([])
    const [nutritionistData, setNutritionistData] = useState([])
    const [surgeryData, setSurgeryData] = useState([])
    const [exportData, setExportData] = useState([])
    const [currentAddresses, setCurrentAddresses] = useState([])
    const [vendorData, setVendorData] = useState([])
    const [openAddressForm, setOpenAddressForm] = useState(false)
    const [idToDelete, setIdToDelete] = useState()
    const [deleteOpenDialog, setDeleteOpenDialog] = useState(false)

    const getId = (params) => params.row.id;

    const getContactChannel = (params) => {
        let contactChannel = contactChannelData.find(item => item.id === params.row.contactChannelId)

        return `${contactChannel ? contactChannel.name : ""}`
    }

    const getCommission = (params) => `${(params.row.commission || 0)}%`

    const getPriceType = (params) => {
        let priceType = priceTypeData.find(item => item.id === params.row.priceTypeId)

        return `${priceType ? priceType.name : ""}`
    }

    const getVendor = (params) => {
        let vendor = vendorData.find(item => item.id === params.row.vendorId)

        return `${vendor ? `${vendor.firstName} ${vendor.lastName}` : ""}`
    }

    const getRecommendedDistributor = (params) => {
        let distributor = clientData.find(item => item.id === params.row.recommendedDistributorId)

        return `${distributor ? `${distributor.firstName} ${distributor.lastName}` : ""}`
    }

    const getNutritionist = (params) => {
        let nutritionist =
            nutritionistData.find(item => item.id === params.row.nutritionistId)

        return `${nutritionist ? nutritionist.name : ""}`
    }

    const getSurgery = (params) => {
        let surgery =
            surgeryData.find(item => item.id === params.row.surgeryId)

        return `${surgery ? surgery.name : ""}`
    }

    const columns = [
        {
            field: "id",
            headerName: " ",
            width: 140,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        aria-label="editar"
                        onClick={() => handleEditClick(params.value)}
                        color="primary">
                        <Edit />
                    </IconButton>
                    <IconButton
                        aria-label="eliminar"
                        onClick={() => handleDeleteClick(params.value)}
                        color="secondary">
                        <Delete />
                    </IconButton>
                </Box>
            )
        },
        {
            field: "fullName",
            headerName: "Nombre Cliente",
            width: 300
        },
        { field: "phone", headerName: "Teléfono", width: 140 },
        {
            field: "vendor",
            headerName: "Vendedor",
            width: 300,
            valueGetter: getVendor,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
            getVendor(cellParam1).localeCompare(getVendor(cellParam2))
        },
        { field: "distributor", headerName: "Distribuidor Comisionista", width: 200, type: 'boolean' },
        { field: "nutritionist", headerName: "Etiqueta Nutriólogo", width: 200, type: 'boolean' },
        { field: "email", headerName: "Correo Electronico", width: 250 },
        { field: "taxRegistry", headerName: "RFC", width: 170 },
        {
            field: "contactChannel",
            headerName: "Medio de Contacto",
            width: 200,
            valueGetter: getContactChannel,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getContactChannel(cellParam1).localeCompare(getContactChannel(cellParam2))
        },
        {
            field: "addresses",
            headerName: "Direcciones",
            width: 160,
            renderCell: (params) => (
                <IconButton aria-label="ver" onClick={() => handleClickAddress(params.value)}>
                    <Visibility />
                </IconButton>
            )
        },
        {
            field: "commissionPercentage",
            headerName: "Comisión",
            width: 160,
            valueGetter: getCommission,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getCommission(cellParam1).localeCompare(getCommission(cellParam2))
        },
        {
            field: "priceType",
            headerName: "Tipo de Precio",
            width: 170,
            valueGetter: getPriceType,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getPriceType(cellParam1).localeCompare(getPriceType(cellParam2))
        },
        {
            field: "recommendeDistributorId",
            headerName: "Recomendado Por",
            width: 200,
            valueGetter: getRecommendedDistributor,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getRecommendedDistributor(cellParam1).localeCompare(getRecommendedDistributor(cellParam2))
        },
        {
            field: "nutritionistId",
            headerName: "Nutriólogo o Grupo",
            width: 230,
            valueGetter: getNutritionist,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getNutritionist(cellParam1).localeCompare(getNutritionist(cellParam2))
        },
        {
            field: "surgeryId",
            headerName: "Cirugía",
            width: 180,
            valueGetter: getSurgery,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getSurgery(cellParam1).localeCompare(getSurgery(cellParam2))
        },
        {
            field: "clientId",
            headerName: "Id",
            width: 300,
            valueGetter: getId,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getId(cellParam1).localeCompare(getId(cellParam2))
        }
    ]

    const exportHeaders = [
        { label: "Id", key: "id" },
        { label: "Nombre", key: "firstName" },
        { label: "Apellidos", key: "lastName" },
        { label: "Correo Electronico", key: "email" },
        { label: "Teléfono", key: "phone" },
        { label: "RFC", key: "taxRegistry" },
        { label: "Direcciòn Prdeterminada", key: "address" },
        { label: "Contactado Por", key: "contactChannel" },
        { label: "Etiqueta Nutriólogo", key: "isNutritionist" },
        { label: "Distribuidor Comisionista", key: "distributor" },
        { label: "Comisión", key: "commission" },
        { label: "Tipo de Precio", key: "priceType" },
        { label: "Recomendado Por", key: "recommendedDistributor" },
        { label: "Nutriólogo o Grupo", key: "nutritionist" },
        { label: "Cirugía", key: "surgery" }];

    const addFunction = (e) => {
        history.push("/client/add")
    }

    const handleDeleteClick = (id) => {
        setIdToDelete(id);
        setDeleteOpenDialog(true);
    }

    const confirmDeleteClick = () => {
        setDeleteOpenDialog(false);

        db.collection('client')
            .doc(idToDelete)
            .delete()
            .then(() => {
                createAlert("success", "Cliente eliminado.")
                console.log("Deleted client document: ", idToDelete);
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar cliente")
                console.error("Error deleting client document: ", error);
            });
    }

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`);

    const handleClickAddress = (addresses) => {
        setCurrentAddresses(addresses);
        setOpenAddressForm(true);
    }

    useEffect(() => {
        trackPromise(
            db.collection("priceType")
                .get()
                .then((result) => {
                    let priceTypes = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        priceTypes.push({ ...docData, id: doc.id })
                    })
                    setPriceTypeData(priceTypes)
                })
                .catch((error) => {
                    console.error("Error retrieving priceTypes: ", error)
                }))
    }, [setPriceTypeData])

    useEffect(() => {
        trackPromise(
            db.collection("nutritionist")
                .get()
                .then((result) => {
                    let nutritionists = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        nutritionists.push({ ...docData, id: doc.id })
                    })
                    setNutritionistData(nutritionists)
                })
                .catch((error) => {
                    console.error("Error retrieving nutritionists: ", error)
                }))
    }, [setNutritionistData])

    useEffect(() => {
        trackPromise(
            db.collection("surgery")
                .get()
                .then((result) => {
                    let surgeries = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        surgeries.push({ ...docData, id: doc.id })
                    })
                    setSurgeryData(surgeries)
                })
                .catch((error) => {
                    console.error("Error retrieving surgeries: ", error)
                }))
    }, [setSurgeryData])

    useEffect(() => {
        trackPromise(
            db.collection("vendor")
                .get()
                .then((result) => {
                    let vendors = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        vendors.push({ ...docData, id: doc.id })
                    })
                    setVendorData(vendors)
                })
                .catch((error) => {
                    console.error("Error retrieving vendors: ", error)
                }))
    }, [setVendorData])

    useEffect(() => {
        let getAddressString = (address) => {
            let line1 = `${address.street} ${address.extNumber} ${address.intRef && ` int ${address.intRef}`}`
            let line2 = `${address.suburb}, ${address.zipCode}`
            let line3 = `${address.city}, ${address.state}`

            return `${line1}\n${line2}\n${line3}`
        }

        let data = []
        
        if(!clientData )
        {
            return
        }

        data = clientData.map(client => {

            const { addresses, contactChannelId, nutritionist,
                distributor, commission, priceTypeId, recommendedDistributorId,
                nutritionistId, surgeryId, ...clientToExport } = client

            let contactChannel =
                contactChannelData.find(item => item.id === client.contactChannelId)
            let priceType =
                priceTypeData.find(item => item.id === client.priceTypeId)
            let recommendedDistributor =
                clientData.find(item => item.id === client.recommendedDistributorId)
            let nutritionistOrGroup =
                nutritionistData.find(item => item.id === client.nutritionistId)
            let surgery =
                surgeryData.find(item => item.id === client.surgeryId)

            clientToExport.contactChannel = contactChannel ? contactChannel.name : ""
            clientToExport.isNutritionist = client.nutritionist ? "SI" : "NO"
            clientToExport.distributor = client.distributor ? "SI" : "NO"
            clientToExport.commission = `${client.commission}%`
            clientToExport.priceType = priceType ? priceType.name : ""
            clientToExport.recommendedDistributor =
                recommendedDistributor ?
                    `${recommendedDistributor.lastName}, ${recommendedDistributor.firstName}` : ""
            clientToExport.nutritionist = nutritionistOrGroup ? nutritionistOrGroup.name : ""
            clientToExport.surgery = surgery ? surgery.name : ""
            
            let address = client.addresses ? client.addresses[client.mainAddress] : undefined
            clientToExport.address = address ? getAddressString(address) : ""

            return clientToExport;
        })

        return setExportData(data);
    }, [setExportData, clientData, contactChannelData, priceTypeData, nutritionistData, surgeryData, vendorData])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <PageLayout
            title="Clientes"
            data={exportData}
            headers={exportHeaders}
            addFunction={addFunction}>
            <Box height="570px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={clientData}
                            columns={columns} />
                    </Box>
                </Box>
            </Box>
            <AddressViewDialog
                open={openAddressForm}
                setOpen={setOpenAddressForm}
                addresses={currentAddresses} />
            <DeleteDialog
                setOpenDialog={setDeleteOpenDialog}
                openDialog={deleteOpenDialog}
                idToDelete={idToDelete}
                entityTitle="Cliente"
                confirmDeleteClick={confirmDeleteClick} />
        </PageLayout>
    )
}

export default ClientPage
