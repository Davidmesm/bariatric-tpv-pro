import { Box, IconButton } from "@material-ui/core"
import { Delete, Edit } from "@material-ui/icons"
import React, { useEffect, useState } from "react"
import { DataGrid } from '@material-ui/data-grid'
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import { useHistory, useRouteMatch } from "react-router"
import { useAlerts } from "../../contexts/AlertsContext"
import { db } from "../../firebase"
import PageLayout from "../components/PageLayout"
import DeleteDialog from "../../components/dialogs/DeleteDialog"
import Loading from "../../components/Loading"

const SalePage = () => {

    const history = useHistory()
    let { url } = useRouteMatch()
    const { promiseInProgress } = usePromiseTracker()
    const { createAlert } = useAlerts()

    const [salesData, setSalesData] = useState([])
    const [clientData, setClientData] = useState([])
    const [vendorData, setVendorData] = useState([])
    const [idToDelete, setIdToDelete] = useState()
    const [deleteOpenDialog, setDeleteOpenDialog] = useState(false)
    const [bankAccountData, setBankAccountData] = useState([])
    const [bankData, setBankData] = useState([])
    const [paymentTypeData, setPaymentTypeData] = useState([])
    const [productData, setProductData] = useState([])
    const [exportData, setExportData] = useState([])

    const getClient = (params) => {
        let client = clientData.find(item => item.id === params.row.clientId)

        return `${client ? `${client.firstName} ${client.lastName}` : ""}`
    }

    const getBuyer = (params) => {
        let client = clientData.find(item => item.id === params.row.buyerId)

        return `${client ? `${client.firstName} ${client.lastName}` : ""}`
    }

    const getDistributor = (params) => {
        let client = clientData.find(item => item.id === params.row.distributorId)
        if(client) {
            return `${client ? `${client.firstName} ${client.lastName}` : ""}`}
        else {
            return getClient(params)
        }
    }

    const getVendor = (params) => {
        let vendor = vendorData.find(item => item.id === params.row.vendorId)

        return `${vendor ? `${vendor.firstName} ${vendor.lastName}` : ""}`
    }
    const getVendorCommission = (params) => {
        let client = clientData.find(item => item.id === params.row.clientId)

        if(!client || !client.vendorId)
        {
            return ""
        }

        let vendor = vendorData.find(item => item.id === client.vendorId)

        return `${vendor ? `${vendor.firstName} ${vendor.lastName}` : ""}`
    }

    const getPaymentType = (params) => {
        let paymentType = paymentTypeData.find(item => item.id === params.row.paymentTypeId)

        return paymentType ? paymentType.name : ""
    }

    const getBankAccount = (params) => {
        let bankAccount = bankAccountData.find(item => item.id === params.row.bankAccountId)

        if (bankAccount) {
            let bank = bankData.find(item => item.id === bankAccount.bankId)

            if (bank) {
                return `${bank.name}...${bankAccount.account.substr(bankAccount.account.length - 4)}`
            }

            return bankAccount.account
        }

        return ""
    }

    const getId = (params) => {
        if(!params.row)
        {
            return params.id
        }

        let id = params.row.id
        return id
    }

    const columns = [
        {
            field: "id",
            headerName: " ",
            width: 160,
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
            field: "saleId",
            headerName: "Id",
            width: 220,
            valueGetter: getId,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getId(cellParam1).localeCompare(getId(cellParam2))

        },
        { field: "date", headerName: "Fecha", width: 150, type: "date" },
        {
            field: "client",
            headerName: "Cliente Final",
            width: 300,
            valueGetter: getClient,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getClient(cellParam1).localeCompare(getClient(cellParam2))
        },
        {
            field: "buyer",
            headerName: "Comprador",
            width: 300,
            valueGetter: getBuyer,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getBuyer(cellParam1).localeCompare(getBuyer(cellParam2))
        },
        {
            field: "distributor",
            headerName: "Distribuidor/Cliente Independiente",
            width: 300,
            valueGetter: getDistributor,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getDistributor(cellParam1).localeCompare(getDistributor(cellParam2))
        },
        {
            field: "vendorCom",
            headerName: "Vendedor Comisionista",
            width: 250,
            valueGetter: getVendorCommission,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getVendor(cellParam1).localeCompare(getVendorCommission(cellParam2))
        },
        {
            field: "vendor",
            headerName: "Atendio la Venta",
            width: 250,
            valueGetter: getVendor,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getVendor(cellParam1).localeCompare(getVendor(cellParam2))
        },
        { field: "hasChargeDelivery", headerName: "Cobrar Envio", width: 200, type: "boolean" },
        {
            field: "deliveryCost",
            headerName: "Costo Envio",
            width: 150,
            valueFormatter: (params) => `$${parseFloat(params.value).toFixed(2)}`
        },
        {
            field: "totalProducts",
            headerName: "Total s/ Envio",
            width: 250,
            valueFormatter: (params) => `$${parseFloat(params.value).toFixed(2)}`
        },
        {
            field: "commissionApplied",
            headerName: "Comisión Aplicadas",
            width: 250,
            valueFormatter: (params) => `- $${parseFloat((params.value || 0)).toFixed(2)}`
        },
        {
            field: "diffCommission",
            headerName: "Utilidad Diferencial",
            width: 200,
            valueFormatter: (params) => `$${parseFloat((params.value || 0)).toFixed(2)}`
        },
        {
            field: "level1Commission",
            headerName: "Comisión Nivel 1",
            width: 200,
            valueFormatter: (params) => `$${parseFloat((params.value || 0)).toFixed(2)}`
        },
        {
            field: "level2Commission",
            headerName: "Comisión Nivel 2",
            width: 200,
            valueFormatter: (params) => `$${parseFloat((params.value || 0)).toFixed(2)}`
        },
        {
            field: "vendorCommission",
            headerName: "Comisión Vendedor",
            width: 250,
            valueFormatter: (params) => `$${parseFloat((params.value || 0)).toFixed(2)}`
        },
        {
            field: "total",
            headerName: "Total",
            width: 150,
            valueFormatter: (params) => `$${parseFloat(params.value || 0).toFixed(2)}`
        },
        {
            field: "paymentType",
            headerName: "Forma de Pago",
            width: 200,
            valueGetter: getPaymentType,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getPaymentType(cellParam1).localeCompare(getPaymentType(cellParam2))
        },
        {
            field: "bankAccount",
            headerName: "Cuenta Banco",
            width: 200,
            valueGetter: getBankAccount,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getBankAccount(cellParam1).localeCompare(getBankAccount(cellParam2))
        }
    ]

    const exportColumns = [
        { label: "Id", key: "id" },
        { label: "Client Final", key: "client" },
        { label: "Distribuidor/Cliente Independiente", key: "buyer" },
        { label: "Vendedor", key: "vendor" },
        { label: "Total Sin Envió", key: "totalProducts" },
        { label: "Cobrar Envió", key: "hasChargeDelivery" },
        { label: "Costo Envió", key: "deliveryCost" },
        { label: "Distribuidor", key: "distributor" },
        { label: "Utilidad Diferencial", key: "diffCommission" },
        { label: "Distribuidor Nivel 1", key: "level1Distributor" },
        { label: "Comisión Nivel 1", key: "level1Commission" },
        { label: "Distribuidor Nivel 2", key: "level2Distributor" },
        { label: "Comisión Nivel 2", key: "level2Commission" },
        { label: "Comisión Vendedor", key: "vendorCommission" },
        { label: "Total Pagado", key: "total" },
        { label: "Forma de Pago", key: "paymentType" },
        { label: "Banco", key: "bank" },
        { label: "Cuenta", key: "account" },
        { label: "Calle", key: "address.street" },
        { label: "Numero", key: "address.extNumber" },
        { label: "Interior", key: "address.intRef" },
        { label: "Código Postal", key: "address.zipCode" },
        { label: "Colonia", key: "address.suburb" },
        { label: "Ciudad", key: "address.city" },
        { label: "Estado", key: "address.state" },
        { label: "Producto", key: "product" },
        { label: "Versión", key: "flavour" },
        { label: "Cantidad", key: "qty" },
        { label: "Precio", key: "price" },
        { label: "Precio Sugerido", key: "defaultPrice" },
        { label: "Costo", key: "cost" },
        { label: "Total", key: "total" },

    ];

    const addFunction = () => {
        history.push("/sale/add")
    }

    const handleDeleteClick = (id) => {
        setIdToDelete(id)
        setDeleteOpenDialog(true)
    }

    const confirmDeleteClick = () => {
        setDeleteOpenDialog(false)

        let promiseDelInventory = deleteInventory(idToDelete)
        let promiseDelClientCommission = deleteClientCommission(idToDelete)
        let promiseDelVendorCommission = deleteVendorCommission(idToDelete)
        let promiseDelDelivery = deleteDelivery(idToDelete)
        let promiseDelSale = db.collection("sale").doc(idToDelete).delete()

        Promise.all([promiseDelInventory, promiseDelClientCommission,
            promiseDelVendorCommission, promiseDelSale, promiseDelDelivery])
            .then(() => {
                createAlert("success", "Venta eliminada.")
                console.log("Deleted sale document: ", idToDelete)
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar la venta")
                console.error("Error deleting sale document: ", error)
            })
    }

    const deleteVendorCommission = (id) =>
        new Promise((resolve, reject) => {
            let promises = []

            db.collection("vendorCommission")
                .where("saleId", "==", id)
                .get()
                .then((result) => {
                    let data = [];
                    result.forEach(doc => {
                        data = [...data, { id: doc.id, ...doc.data() }];
                    })

                    data.forEach(c => {
                        let deletePromise = db.collection("vendorCommission")
                            .doc(c.id)
                            .delete()

                        promises.push(deletePromise)
                    })

                    Promise.all(promises).then(() => {
                        resolve("success")
                    })
                        .catch((error) => {
                            reject(error)
                        })
                })
                .catch((error) => {
                    reject(error)
                })
        })

    const deleteClientCommission = (id) =>
        new Promise((resolve, reject) => {
            let promises = []

            db.collection("clientCommission")
                .where("saleId", "==", id)
                .get()
                .then((result) => {
                    let data = [];
                    result.forEach(doc => {
                        data = [...data, { id: doc.id, ...doc.data() }];
                    })

                    data.forEach(c => {
                        let deletePromise = db.collection("clientCommission")
                            .doc(c.id)
                            .delete()

                        promises.push(deletePromise)
                    })

                    Promise.all(promises).then(() => {
                        resolve("success")
                    })
                        .catch((error) => {
                            reject(error)
                        })
                })
                .catch((error) => {
                    reject(error)
                })
        })

    const deleteInventory = (id) =>
        new Promise((resolve, reject) => {
            db.collection("inventoryOut")
                .where("saleId", "==", id)
                .get()
                .then((result) => {
                    let data = [];
                    result.forEach(doc => {
                        data = [...data, { id: doc.id, ...doc.data() }];
                    })

                    return data;
                })
                .then(invOutData => {
                    let promises = []
                    invOutData.forEach(invOut => {
                        db.collection("inventory")
                            .where("inventoryInId", "==", invOut.inventoryId)
                            .get()
                            .then((result) => {
                                let data = [];
                                result.forEach(doc => {
                                    data = [...data, { id: doc.id, ...doc.data() }];
                                })

                                return data;
                            })
                            .then(inventoryData => {
                                if (inventoryData.length > 0) {
                                    let inventory = inventoryData[0];

                                    let productIndex = inventory.products.findIndex(p => {
                                        if(p.productId === invOut.productId)
                                        {
                                            if(invOut.flavour)
                                            {
                                                if(p.flavour === invOut.flavour)
                                                {
                                                    return true;
                                                }

                                                return false;
                                            }

                                            return true;
                                        }

                                        return false;
                                    })
                                    
                                    const { id, ...inventoryToUpdate } = inventory;

                                    inventoryToUpdate.products[productIndex].qty += invOut.qty;
                                    inventoryToUpdate.products[productIndex].qtyOut -= invOut.qty;

                                    let invPromise = db.collection("inventory")
                                        .doc(inventory.id)
                                        .update(inventoryToUpdate)

                                    promises.push(invPromise)

                                    let invOutPromise = db.collection("inventoryOut")
                                        .doc(invOut.id)
                                        .delete()

                                    promises.push(invOutPromise)
                                }
                            })
                    })

                    Promise.all(promises)
                        .then(results => {
                            resolve("Success")
                        })
                        .catch(error => {
                            reject(error)
                        })
                })
                .catch(error => {
                    reject(error)
                })
        })

    const deleteDelivery = (id) =>
        new Promise((resolve, reject) => {
            let promises = []

            db.collection("delivery")
                .where("saleId", "==", id)
                .get()
                .then((result) => {
                    let data = [];
                    result.forEach(doc => {
                        data = [...data, { id: doc.id, ...doc.data() }];
                    })

                    data.forEach(c => {
                        let deletePromise = db.collection("delivery")
                            .doc(c.id)
                            .delete()

                        promises.push(deletePromise)
                    })

                    Promise.all(promises).then(() => {
                        resolve("success")
                    })
                        .catch((error) => {
                            reject(error)
                        })
                })
                .catch((error) => {
                    reject(error)
                })
        })

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`)

    useEffect(() => {
        const unsubscribe =
            db.collection("sale")
                .orderBy("date", "desc")
                .onSnapshot((snapShot) => {
                    let sales = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data()
                        docData.date = docData.date.toDate()
                        sales.push({ ...docData, id: doc.id })
                    })
                    setSalesData(sales)
                }, (error) => {
                    console.error("Unable to subscribe to sales, error: ", error)
                })

        return unsubscribe
    }, [clientData, vendorData, paymentTypeData, bankAccountData, bankData, productData, setSalesData])

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
        trackPromise(
            db.collection("client")
                .get()
                .then((result) => {
                    let clients = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        clients.push({ ...docData, id: doc.id })
                    })
                    setClientData(clients)
                })
                .catch((error) => {
                    console.error("Error retrieving clients: ", error)
                }))
    }, [setClientData])

    useEffect(() => {
        trackPromise(
            db.collection("paymentType")
                .get()
                .then((result) => {
                    let paymentTypes = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        paymentTypes.push({ ...docData, id: doc.id })
                    })
                    setPaymentTypeData(paymentTypes)
                })
                .catch((error) => {
                    console.error("Error retrieving paymentTypes: ", error)
                }))
    }, [setPaymentTypeData])

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
            db.collection("product")
                .get()
                .then((result) => {
                    let products = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        products.push({ ...docData, id: doc.id })
                    })
                    setProductData(products)
                })
                .catch((error) => {
                    console.error("Error retrieving products: ", error)
                }))
    }, [setProductData])

    useEffect(() => {

        let data = []

        if (!salesData) {
            return
        }

        data = salesData.map(sale => {

            const { total, clientId, buyerId, ...saleToExport } = sale;

            let client =
                clientData.find(item => item.id === sale.clientId);

            let buyer =
                clientData.find(item => item.id === sale.buyerId);

            let vendor =
                vendorData.find(item => item.id === sale.vendorId);

            let paymentType =
                paymentTypeData.find(item => item.id === sale.paymentTypeId);

            let account =
                bankAccountData.find(item => item.id === sale.bankAccountId);

            let distributor;
            if (sale.distributorId) {
                distributor = clientData.find(item => item.id === sale.distributorId);
            }

            let bank;
            if (account) {
                bank = bankData.find(item => item.id === account.bankId);
            }

            let level1Distributor;
            if (sale.level1DistributorId) {
                level1Distributor = clientData.find(item => item.id === sale.level1DistributorId);
            }

            let level2Distributor;
            if (sale.level2DistributorId) {
                level2Distributor = clientData.find(item => item.id === sale.level2DistributorId);
            }

            saleToExport.client = `${client ? `${client.lastName}, ${client.firstName}` : ""}`
            saleToExport.buyer = `${buyer ? `${buyer.lastName}, ${buyer.firstName}` : ""}`
            saleToExport.vendor = `${vendor ? `${vendor.lastName}, ${vendor.firstName}` : ""}`
            saleToExport.paymentType = paymentType ? paymentType.name : "";
            saleToExport.account = account ? account.account : "";
            saleToExport.bank = bank ? bank.name : "";
            saleToExport.totalPayed = sale.total;
            saleToExport.distributor = distributor ? `${distributor.lastName}, ${distributor.firstName}` : "";
            saleToExport.level1Distributor = level1Distributor ? `${level1Distributor.lastName}, ${level1Distributor.firstName}` : "";
            saleToExport.level2Distributor = level2Distributor ? `${level2Distributor.lastName}, ${level2Distributor.firstName}` : "";

            return saleToExport;
        })

        let newData = []

        data.forEach(item => {
            item.products.forEach(p => {
                let newItem = { ...item, ...p };
                newData = [...newData, newItem];
            })
        })

        data = newData.map(sale => {
            const { ...saleToExport } = sale;

            let product = productData.find(item => item.id === sale.productId);

            saleToExport.product = product ? product.name : "";

            return saleToExport;
        })

        return setExportData(data);
    }, [setExportData, clientData, vendorData, paymentTypeData, bankAccountData, bankData, productData, salesData])


    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <PageLayout
            title="Ventas"
            data={exportData}
            headers={exportColumns}
            addFunction={addFunction}>
            <Box height="570px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={salesData}
                            columns={columns} />
                    </Box>
                </Box>
            </Box>
            <DeleteDialog
                setOpenDialog={setDeleteOpenDialog}
                openDialog={deleteOpenDialog}
                idToDelete={idToDelete}
                entityTitle="Venta"
                confirmDeleteClick={confirmDeleteClick} />
        </PageLayout>
    )
}

export default SalePage
