import { Box, Button, ButtonGroup } from "@material-ui/core"
import * as yup from "yup"
import React, { useEffect, useState } from "react"
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import { useHistory, useRouteMatch } from "react-router"
import Loading from "../../components/Loading"
import { useAlerts } from "../../contexts/AlertsContext"
import firebase from "firebase/app"
import { db } from "../../firebase"
import PageLayout from "../components/PageLayout"
import PendingGrid from "./components/PendingGrid"
import SentGrid from "./components/SentGrid"
import DeliveredGrid from "./components/DeliveredGrid"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import SendDialog from "./components/SendDialog"
import RecieveDialog from "./components/RecieveDialog"
import ReturnToPendingDialog from "./components/ReturnToPendingDialog"

const schema = yup.object().shape({
    id: yup.string().required().default(""),
    saleId: yup.string().required().default(""),
    products: yup.array(),
    address: yup.object().shape({
        name: yup.string().required("Nombre requerido").default(""),
        street: yup.string().required("Calle requerida").default(""),
        extNumber: yup.string().required("Numero requerido").default(""),
        intRef: yup.string().optional().default(""),
        zipCode: yup.string().required("Codigo Postal requerido").default(""),
        suburb: yup.string().required("Colonia requerida").default(""),
        city: yup.string().required("Ciudad requerida").default(""),
        state: yup.string().required("Estado requerido").default(""),
        comments: yup.string().optional().default("")
    }),
    client: yup.string().required().default(""),
    phone: yup.string().required().default(""),
    saleDate: yup.date().required(),
    sendDate: yup.date().required("Fecha Envio requerida"),
    parcelService: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Servicio de Paqueteria requerido").default(""),
    trackingGuide: yup.string().required("Guia de Rastreo requerida").default("")
})

const DeliveryPage = () => {

    const { promiseInProgress } = usePromiseTracker()
    const { createAlert } = useAlerts()

    const [exportData, setExportData] = useState([])
    const [exportHeaders, setExportHeaders] = useState([])
    const [currentGrid, setCurrentGrid] = useState(0)
    const [pendingDeliveryData, setPendingDeliveryData] = useState([])
    const [sentDeliveryData, setSentDeliveryData] = useState([])
    const [deliveredDeliveryData, setDeliveredDeliveryData] = useState([])
    const [clientData, setClientData] = useState([])
    const [productData, setProductData] = useState([])
    const [openPendingDialog, setOpenPendingDialog] = useState(false)
    const [openRecieveDialog, setOpenRecieveDialog] = useState(false)
    const [openReturnToPendingDialog, setOpenReturnToPendingDialog] = useState(false)
    const [idToRecieve, setIdToRecieve] = useState()
    const [idToReturn, setIdToReturn] = useState()
    const [parcelServiceData, setParcelServiceData] = useState([])

    // eslint-disable-next-line no-extend-native
    Date.prototype.yyyymmdd = function () {
        var mm = this.getMonth() + 1
        var dd = this.getDate()

        return [(dd > 9 ? "" : "0") + dd,
            "/",
        (mm > 9 ? "" : "0") + mm,
            "/",
        this.getFullYear()].join("")
    }

    const confirmRecieveClick = () => {
        if(idToRecieve)
        {
            db.collection('delivery')
            .doc(idToRecieve).get()
            .then((doc) => {
                if(doc.exists)
                {
                    let docData = doc.data()
                    docData.status = "Entregado"
                    docData.recievedDate = firebase.firestore.Timestamp.fromDate(new Date());

                    db.collection('delivery')
                    .doc(idToRecieve).update(docData)
                    .then(() => {
                        createAlert("success", "Actualizado.")
                        setOpenRecieveDialog(false)
                    })
                    .catch((error) => {
                        console.error("error updating delivery: ", error)
                        createAlert("error", "No se pudo actualizar el envio")
                    })
                }
            })
            .catch((error) => {
                console.error("delivery not found: ", error)
                createAlert("error", "No se pudo actualizar el envio")
            })
        }
    }

    const confirmReturnClick = () => {
        if(!idToReturn)
        {
            setOpenReturnToPendingDialog(false)
            return
        }

        db.collection('delivery')
            .doc(idToReturn).get()
            .then((doc) => {
                if(doc.exists)
                {
                    let docData = doc.data()
                    docData.status = "Pendiente"
                    docData.parcelService = null
                    docData.trackingGuide = null
                    docData.sendDate = null

                    db.collection('delivery')
                    .doc(idToReturn).update(docData)
                    .then(() => {
                        createAlert("success", "Actualizado.")
                        setOpenReturnToPendingDialog(false)
                    })
                    .catch((error) => {
                        console.error("error updating delivery: ", error)
                        createAlert("error", "No se pudo actualizar el envio")
                        setOpenReturnToPendingDialog(false)
                    })
                }
            })
            .catch((error) => {
                console.error("delivery not found: ", error)
                createAlert("error", "No se pudo actualizar el envio")
                setOpenReturnToPendingDialog(false)
            })
    }

    const { control, handleSubmit, setValue, reset,
        formState: { errors, isSubmitting } } =
        useForm({
            resolver: yupResolver(schema),
            defaultValues: schema.cast()
        })

    useEffect(() => {
        const unsubscribe =
            db.collection('delivery')
                .orderBy("saleDate", "desc")
                .onSnapshot((snapShot) => {
                    let pending = []
                    let sent = []
                    let delivered = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data()

                        docData.saleDate = docData.saleDate.toDate()

                        if (docData.sendDate) {
                            docData.sendDate = docData.sendDate.toDate()
                        }

                        if (docData.recievedDate) {
                            docData.recievedDate = docData.recievedDate.toDate()
                        }

                        if (docData.status === "Pendiente") {
                            pending.push({ id: doc.id, ...docData })
                        }
                        else if (docData.status === "Enviado") {
                            sent.push({ id: doc.id, ...docData })
                        }
                        else if (docData.status === "Entregado") {
                            delivered.push({ id: doc.id, ...docData })
                        }
                    })

                    setPendingDeliveryData(pending)
                    setSentDeliveryData(sent)
                    setDeliveredDeliveryData(delivered)

                }, (error) => {
                    console.error("Unable to subscribe to delivery, error: ", error)
                })

        return unsubscribe
    }, [productData, clientData, setDeliveredDeliveryData, setPendingDeliveryData, setSentDeliveryData])

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
        const unsubscribe = db.collection("parcelService")
            .orderBy("order")
            .onSnapshot((snapShot) => {
                let parcelServices = []
                snapShot.forEach((doc) => {
                    let docData = doc.data();
                    parcelServices.push({ value: doc.id, label: docData.name, render: docData.name })
                })
                setParcelServiceData(parcelServices);
            }, (error) => {
                console.error("Unable to subscribe to parcelService, error: ", error)
            })
        return unsubscribe
    }, [setParcelServiceData])
    

    useEffect(() => {
        let pendingHeaders = [
            { label: "Id", key: "id" },
            { label: "Id de Venta", key: "saleId" },
            { label: "Fecha Venta", key: "saleDate" },
            { label: "Productos", key: "products" },
            { label: "Cliente", key: "client" },
            { label: "RFC", key: "taxRegistry" },
            { label: "Teléfono", key: "phone" },
            { label: "Dirección", key: "address" },
        ]

        let sentHeaders = [
            { label: "Id", key: "id" },
            { label: "Id de Venta", key: "saleId" },
            { label: "Fecha Venta", key: "saleDate" },
            { label: "Productos", key: "products" },
            { label: "Cliente", key: "client" },
            { label: "Teléfono", key: "phone" },
            { label: "Dirección", key: "address" },
            { label: "Fecha Envio", key: "sendDate" },
            { label: "Paqueteria", key: "parcelService" },
            { label: "Guia de Rastreo", key: "trackingGuide" }
        ]

        let deliveredHeaders = [
            { label: "Id", key: "id" },
            { label: "Id de Venta", key: "saleId" },
            { label: "Fecha Venta", key: "saleDate" },
            { label: "Productos", key: "products" },
            { label: "Cliente", key: "client" },
            { label: "Teléfono", key: "phone" },
            { label: "Dirección", key: "address" },
            { label: "Fecha Entrega", key: "recievedDate" },
            { label: "Paqueteria", key: "parcelService" },
            { label: "Guia de Rastreo", key: "trackingGuide" }
        ]

        const getAddressString = (address) => {
            let line1 = `${address.street} ${address.extNumber} ${address.intRef && ` int ${address.intRef}`}`
            let line2 = `${address.suburb}, ${address.zipCode}`
            let line3 = `${address.city}, ${address.state}`

            return `${line1}\n${line2}\n${line3}`
        }

        const getProductsString = (products) => {
            let productString = ""

            products.forEach(p => {
                let product = productData.find(item => item.id === p.productId)

                if (product) {
                    let line = `Producto: ${product.name} ${p.flavour || ""}, Cantidad: ${p.qty}`
                    productString = `${productString}\n${line}`
                }
            })

            return productString
        }

        const getPendingDeliveryData = () => {
            return new Promise((resolve) => {
                let data = []

                if (pendingDeliveryData.length === 0) {
                    return data
                }

                data = pendingDeliveryData.map(delivery => {
                    const { address, products, clientId, saleDate, ...deliveryToExport } = delivery

                    let client = clientData.find(item => item.id === delivery.clientId)

                    deliveryToExport.client = client ? `${client.firstName} ${client.lastName}` : ""
                    deliveryToExport.taxRegistry = client ? client.taxRegistry : ""
                    deliveryToExport.phone = client ? client.phone : ""
                    deliveryToExport.address = getAddressString(delivery.address)
                    deliveryToExport.products = getProductsString(delivery.products)
                    deliveryToExport.saleDate = delivery.saleDate.yyyymmdd()

                    return deliveryToExport
                })

                resolve(data)
            })
        }

        const getSentDeliveryData = () => {
            return new Promise((resolve) => {
                let data = []

                if (sentDeliveryData.length === 0) {
                    return data
                }

                data = sentDeliveryData.map(delivery => {
                    const { address, products, clientId, saleDate, sent_date, ...deliveryToExport } = delivery

                    let client = clientData.find(item => item.id === delivery.clientId)

                    deliveryToExport.client = client ? `${client.firstName} ${client.lastName}` : ""
                    deliveryToExport.phone = client ? client.phone : ""
                    deliveryToExport.address = getAddressString(delivery.address)
                    deliveryToExport.products = getProductsString(delivery.products)
                    deliveryToExport.saleDate = delivery.saleDate.yyyymmdd()
                    deliveryToExport.sendDate = delivery.sendDate.yyyymmdd()

                    return deliveryToExport
                })

                resolve(data)
            })
        }

        const getDeliveredDeliveryData = () => {
            return new Promise((resolve) => {
                let data = []

                if (deliveredDeliveryData.length === 0) {
                    return data
                }

                data = deliveredDeliveryData.map(delivery => {
                    const { address, products, clientId, saleDate, recieved_date, ...deliveryToExport } = delivery

                    let client = clientData.find(item => item.id === delivery.clientId)

                    deliveryToExport.client = client ? `${client.firstName} ${client.lastName}` : ""
                    deliveryToExport.phone = client ? client.phone : ""
                    deliveryToExport.address = getAddressString(delivery.address)
                    deliveryToExport.products = getProductsString(delivery.products)
                    deliveryToExport.saleDate = delivery.saleDate.yyyymmdd()
                    deliveryToExport.recievedDate = delivery.recievedDate ? delivery.recievedDate.yyyymmdd() : ""

                    return deliveryToExport
                })

                resolve(data)
            })
        }

        if (currentGrid === 0) {
            getPendingDeliveryData().then(data => {
                setExportData(data)
            })

            setExportHeaders(pendingHeaders)
        } else if (currentGrid === 1) {
            getSentDeliveryData().then(data => {
                setExportData(data)
            })

            setExportHeaders(sentHeaders)
        } else if (currentGrid === 2) {
            getDeliveredDeliveryData().then(data => {
                setExportData(data)
            })

            setExportHeaders(deliveredHeaders)
        }
    }, [currentGrid, pendingDeliveryData, sentDeliveryData, deliveredDeliveryData, clientData, productData])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <PageLayout
            title="Envios"
            data={exportData}
            headers={exportHeaders}
            disableAddButton={true}>
            <Box paddingTop={3} width="100%">
                <Box width="100%" display="flex" justifyContent="space-between">
                    <Box>
                        <ButtonGroup color="secondary" aria-label="large outlined secondary button group">
                            <Button onClick={() => setCurrentGrid(0)}>
                                Pendientes
                            </Button>
                            <Button onClick={() => setCurrentGrid(1)}>
                                Enviados
                            </Button>
                            <Button onClick={() => setCurrentGrid(2)}>
                                Entregados
                            </Button>
                        </ButtonGroup>
                    </Box>
                </Box>
                <br />
                <br />
                <br />
                {currentGrid === 0 &&
                    <PendingGrid
                        data={pendingDeliveryData}
                        clientData={clientData}
                        productData={productData}
                        setOpenDialog={setOpenPendingDialog}
                        setValue={setValue}
                        reset={reset}
                    />}
                {currentGrid === 1 &&
                    <SentGrid
                        data={sentDeliveryData}
                        clientData={clientData}
                        setOpenDialogReturn={setOpenReturnToPendingDialog}
                        setIdToReturn={setIdToReturn}
                        setOpenDialogRecieve={setOpenRecieveDialog}
                        parcelServiceData={parcelServiceData}
                        setIdToRecieve={setIdToRecieve}
                    />}
                {currentGrid === 2 &&
                    <DeliveredGrid
                        data={deliveredDeliveryData}
                        clientData={clientData}
                        parcelServiceData={parcelServiceData}
                    />}
            </Box>
            <SendDialog
                control={control}
                errors={errors}
                setValue={setValue}
                openDialog={openPendingDialog}
                setOpenDialog={setOpenPendingDialog}
                parcelServiceData={parcelServiceData}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting} />
            <RecieveDialog
                setOpenDialog={setOpenRecieveDialog}
                openDialog={openRecieveDialog}
                idToDelete={idToRecieve}
                confirmRecieveClick={confirmRecieveClick} />
            <ReturnToPendingDialog
                setOpenDialog={setOpenReturnToPendingDialog}
                openDialog={openReturnToPendingDialog}
                idToDelete={idToReturn}
                confirmRecieveClick={confirmReturnClick} />
        </PageLayout>
    )
}

export default DeliveryPage
