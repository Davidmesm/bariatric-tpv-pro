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

const VendorPage = () => {
    const history = useHistory()
    let { url } = useRouteMatch()
    const { promiseInProgress } = usePromiseTracker()
    const { createAlert } = useAlerts()

    const [vendorData, setVendorData] = useState([])
    const [bankAccountData, setBankAccountData] = useState([])
    const [bankData, setBankData] = useState([])
    const [exportData, setExportData] = useState([])
    const [currentAddresses, setCurrentAddresses] = useState([])
    const [openAddressForm, setOpenAddressForm] = useState(false)
    const [idToDelete, setIdToDelete] = useState()
    const [deleteOpenDialog, setDeleteOpenDialog] = useState(false)

    const getId = (params) => params.row.id

    const getFullName = (params) => `${params.row.firstName || ""} ${params.row.lastName || ""}`

    const getCommission = (params) => `${(params.row.commission || 0)}%`

    const getBank = (params) => {
        let bankAccount = bankAccountData.find(item => item.id === params.row.bankAccountId)

        let bank;

        if (bankAccount) {
            bank = bankData.find(item => item.id === bankAccount.bankId)
        }

        return `${bank ? bank.name : ""}`
    }

    const getAccount = (params) => {
        let bankAccount = bankAccountData.find(item => item.id === params.row.bankAccountId)
        return `${bankAccount ? bankAccount.account : ""}`
    }

    const getCLABE = (params) => {
        let bankAccount = bankAccountData.find(item => item.id === params.row.bankAccountId)
        return `${bankAccount ? bankAccount.clabe : ""}`
    }

    const getDebitCard = (params) => {
        let bankAccount = bankAccountData.find(item => item.id === params.row.bankAccountId)
        return `${bankAccount ? bankAccount.debitCard : ""}`
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
            field: "vendorId",
            headerName: "Id",
            width: 200,
            valueGetter: getId,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getId(cellParam1).localeCompare(getId(cellParam2))
        },
        {
            field: "fullName",
            headerName: "Nombre",
            width: 300,
            valueGetter: getFullName,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getFullName(cellParam1).localeCompare(getFullName(cellParam2))
        },
        { field: "businessEmail", headerName: "Correo Laboral", width: 200 },
        { field: "personalEmail", headerName: "Correo Personal", width: 200 },
        { field: "phone", headerName: "Teléfono Casa", width: 200 },
        { field: "cellphone", headerName: "Celular Personal", width: 200 },
        { field: "workCellphone", headerName: "Celular Empresa", width: 200 },
        {
            field: "addresses",
            headerName: "Direcciones",
            width: 130,
            renderCell: (params) => (
                <IconButton aria-label="ver" onClick={() => handleClickAddress(params.value)}>
                    <Visibility />
                </IconButton>
            )
        },
        { field: "taxRegistry", headerName: "RFC", width: 170 },
        { field: "curp", headerName: "CURP", width: 200 },
        { field: "securityServiceNumber", headerName: "NSS", width: 150 },
        {
            field: "commissionPercentage",
            headerName: "Comisión",
            width: 150,
            valueGetter: getCommission,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getCommission(cellParam1).localeCompare(getCommission(cellParam2))
        },
        {
            field: "bank",
            headerName: "Banco",
            width: 150,
            valueGetter: getBank,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getBank(cellParam1).localeCompare(getBank(cellParam2))
        },
        {
            field: "account",
            headerName: "Cuenta",
            width: 150,
            valueGetter: getAccount,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getAccount(cellParam1).localeCompare(getAccount(cellParam2))
        },
        {
            field: "clabe",
            headerName: "CLABE",
            width: 200,
            valueGetter: getCLABE,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getCLABE(cellParam1).localeCompare(getCLABE(cellParam2))
        },
        {
            field: "debitCard",
            headerName: "No. Tarjeta Dabito",
            width: 200,
            valueGetter: getDebitCard,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getDebitCard(cellParam1).localeCompare(getDebitCard(cellParam2))
        }
    ];

    const exportHeaders = [
        { label: "Id", key: "id" },
        { label: "Nombre", key: "firstName" },
        { label: "Apellido", key: "lastName" },
        { label: "Correo Laboral", key: "businessEmail" },
        { label: "Correo Personal", key: "personalEmail" },
        { label: "Teléfono Casa", key: "phone" },
        { label: "Celular Personal", key: "cellphone" },
        { label: "Celular Empresa", key: "workCellphone" },
        { label: "Direcciòn Predeterminada", key: "address" },
        { label: "RFC", key: "taxRegistry" },
        { label: "CURP", key: "curp" },
        { label: "NSS", key: "securityServiceNumber" },
        { label: "Banco", key: "bank" },
        { label: "Cuenta", key: "account" },
        { label: "CLABE", key: "clabe" },
        { label: "Tarjeta Debito", key: "debitCard" }
    ];

    const addFunction = (e) => {
        history.push("/vendor/add")
    }

    const handleDeleteClick = (id) => {
        setIdToDelete(id);
        setDeleteOpenDialog(true);
    }

    const confirmDeleteClick = () => {
        setDeleteOpenDialog(false);

        db.collection('vendor')
            .doc(idToDelete)
            .delete()
            .then(() => {
                createAlert("success", "Vendedor eliminado.")
                console.log("Deleted vendor document: ", idToDelete);
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar vendedor")
                console.error("Error deleting vendor document: ", error);
            });
    }

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`);

    const handleClickAddress = (addresses) => {
        setCurrentAddresses(addresses);
        setOpenAddressForm(true);
    }

    useEffect(() => {
        const unsubscribe =
            db.collection("vendor")
                .orderBy("firstName")
                .onSnapshot((snapShot) => {
                    let vendors = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        vendors.push({ ...docData, id: doc.id })
                    })
                    setVendorData(vendors);
                }, (error) => {
                    console.error("Unable to subscribe to vendor, error: ", error)
                })

        return unsubscribe;
    }, [setVendorData, bankData, bankAccountData])

    useEffect(() => {
        trackPromise(
            db.collection("bank")
                .get()
                .then((result) => {
                    let banks = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        banks.push({ ...docData, id: doc.id })
                    })
                    setBankData(banks)
                })
                .catch((error) => {
                    console.error("Error retrieving banks: ", error)
                }))
    }, [setBankData])

    useEffect(() => {
        trackPromise(
            db.collection("bankAccount")
                .get()
                .then((result) => {
                    let bankAccounts = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        bankAccounts.push({ ...docData, id: doc.id })
                    })
                    setBankAccountData(bankAccounts)
                })
                .catch((error) => {
                    console.error("Error retrieving bankAccounts: ", error)
                }))
    }, [setBankAccountData])

    useEffect(() => {
        let getAddressString = (address) => {
            let line1 = `${address.street} ${address.extNumber} ${address.intRef && ` int ${address.intRef}`}`
            let line2 = `${address.suburb}, ${address.zipCode}`
            let line3 = `${address.city}, ${address.state}`

            return `${line1}\n${line2}\n${line3}`
        }

        let data = []

        if (!vendorData) {
            return
        }

        data = vendorData.map(vendor => {
            const { addresses, commission, bankAccountId,
                ...vendorToExport } = vendor

            let bankAccount =
                bankAccountData.find(item => item.id === vendor.bankAccountId)
            let bank = bankAccount ?
                bankData.find(item => item.id === bankAccount.bankId) : undefined

            vendorToExport.commission = `${vendor.commission}%`
            vendorToExport.bank = bank ? bank.name : ""
            vendorToExport.account = bankAccount ? bankAccount.account : ""
            vendorToExport.clabe = bankAccount ? bankAccount.clabe : ""
            vendorToExport.debitCard = bankAccount ? bankAccount.debitCard : ""

            let address = vendor.addresses && vendor.mainAddress ?
                vendor.addresses[vendor.mainAddress] : undefined

            vendorToExport.address = address ? getAddressString(address) : ""

            return vendorToExport;
        })

        return setExportData(data);
    }, [setExportData, vendorData, bankData, bankAccountData])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <PageLayout
            title="Vendedores"
            data={exportData}
            headers={exportHeaders}
            addFunction={addFunction}>
            <Box height="400px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={vendorData}
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
                entityTitle="Vendedor"
                confirmDeleteClick={confirmDeleteClick} />
        </PageLayout>
    )
}

export default VendorPage
