import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import FormPageLayout from "../components/FormPageLayout"
import * as yup from "yup"
import { Box, Button, Step, StepLabel, Stepper } from "@material-ui/core"
import { yupResolver } from "@hookform/resolvers/yup"
import { db } from "../../firebase"
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import Loading from "../../components/Loading"
import { useHistory } from "react-router"
import { Alert } from "@material-ui/lab"
import GeneralInfoForm from "./components/GeneralInfoForm"
import PaymentInfoForm from "./components/PaymentInfoForm"
import ProductInfoForm from "./components/ProductInfoForm"
import { useAlerts } from "../../contexts/AlertsContext"
import firebase from "firebase/app"

const productSchema = yup.object().shape({
    productId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Producto requerido"),
    flavour: yup.string().transform((value) => {
        return value ? value.value : ""
    }).optional(),
    available: yup.number().required().default(0),
    price: yup.string().transform((value) => {
        return value.value ? value.value : value
    }).required("Precio requerido"),
    defaultPrice: yup.number().optional().default(0),
    qty: yup.number().required("Cantidad requerida").default(0),
    total: yup.number().optional().default(0)
})

const schema = yup.object().shape({
    date: yup.date().required("Fecha requerida"),
    vendorId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Vendedor requerido"),
    clientId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Cliente Final requerido"),
    buyerId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Comprador requerido"),
    distributorId: yup.string().optional(),
    warehouseId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Almacen requerido"),
    hasChargeDelivery: yup.boolean().optional().default(false),
    deliveryCost: yup.number().optional().default(200),
    addressIndex: yup.number().transform((value) => {
        return value ? value.value : 0
    }).required("Dirección requerida"),
    delivered: yup.boolean().optional().default(false),
    products: yup.array().of(productSchema)
        .min(1, "Productos requeridos").default([]),
    totalProducts: yup.number().optional().default(0),
    total: yup.number().optional().default(0),
    requiresInvoice: yup.boolean().optional().default(false),
    hasCommissionApplied: yup.boolean().optional().default(false),
    commissionApplied: yup.number().optional().default(0),
    paymentTypeId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Forma de Pago requerido"),
    bankAccountId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).optional()
})

const SaleAddPage = () => {
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: schema.cast()
    })

    const { promiseInProgress } = usePromiseTracker()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const { handleSubmit, trigger, watch, setError,
        formState: { errors, isSubmitting } } = methods

    const watchProducts = watch("products")
    const watchClientId = watch("clientId")
    const watchWarehouseId = watch("warehouseId")

    const [activeStep, setActiveStep] = useState(0)
    const [vendorData, setVendorData] = useState([])
    const [clientData, setClientData] = useState([])
    const [productData, setProductData] = useState([])
    const [warehouseData, setWarehouseData] = useState([])
    const [warehouseInventoryData, setWarehouseInventoryData] = useState([])
    const [bankAccountData, setBankAccountData] = useState([])
    const [bankData, setBankData] = useState([])
    const [paymentTypeData, setPaymentTypeData] = useState([])
    const [clientCommissionData, setClientCommissionData] = useState([])
    const [priceTypeData, setPriceTypeData] = useState([])

    const onSubmit = async (data) => {
        trackPromise(
            saveSale(data).then(() => {
                createAlert("success", "Venta creada.")
                history.push("/sale")
            }).catch((error) => {
                console.error("Error saving sale: ", error)
                setError("save", {
                    type: "firebase-error",
                    message: "Error Desconcido: No se pudo guardar la venta."
                })
            })
        )
    }

    const saveSale = async (data) => {
        try {
            let client, vendor
            let clientPromise = getClient(data.clientId)
            let productsPromise = castPrice(data.products)

            await Promise.all([clientPromise, productsPromise]).then(async (values) => {
                client = values[0]

                if (client && client.recommendedDistributorId) {
                    data.distributorId = client.recommendedDistributorId
                    data.vendorToCommission = client.vendorId
                    vendor = await getVendor(client.vendorId)
                }

                data.products = values[1]
            }).catch((error) => {
                console.log(error)
            })

            data.priceTypeId = client.priceTypeId
            data.addressIndex = data.address.value

            let diffCommissionPromise = getDiffCommission(client, data.buyerId, data.priceTypeId, data.products)
            let level1DistributorPromise = getLevel1Distributor(client)
            let getAddressPromise = getAddress(client, data.addressIndex)

            await Promise.all([diffCommissionPromise, level1DistributorPromise, getAddressPromise]).then((values) => {
                data.diffCommission = values[0]
                data.totalAfterCommission = data.totalProducts - data.diffCommission

                if (vendor && vendor.commission) {
                    data.vendorCommissionPercent = vendor.commission / 100
                    data.vendorCommission = data.vendorCommissionPercent * data.totalAfterCommission
                }

                if (values[1]) {
                    let level1Distributor = values[1]

                    data.level1DistributorId = level1Distributor.value
                    data.level1CommissionPercent = level1Distributor.commission / 100
                    data.level1Commission = data.level1CommissionPercent * data.totalAfterCommission
                }
                data.address = values[2]
            })

            if (data.level1DistributorId) {
                await Promise.resolve(getLevel2Distributor(data.level1DistributorId).then(level2Distributor => {
                    if (level2Distributor) {
                        data.level2DistributorId = level2Distributor.value
                        data.level2CommissionPercent = level2Distributor.commission / 100
                        data.level2Commission = data.level2CommissionPercent * data.totalAfterCommission
                    }
                }))
            }

            const { ...dataToSave } = data

            let infoResult = await getInventoryInformation(data.products)

            if (infoResult) {
                data.cost = infoResult.cost
            }

            let saleId = await db.collection('sale')
                .add(dataToSave).then((docRef) => {
                    return (docRef.id)
                }).catch((error) => {
                    throw new Error(error)
                })

            let promises = []

            if (infoResult.invOut && infoResult.invOut.length > 0) {
                infoResult.invOut.forEach(out => {
                    let batch = warehouseInventoryData.find(b => b.inventoryInId === out.inventoryId)

                    if (!batch) {
                        throw new Error(`inventory batch "${out.inventoryId}" not found`)
                    }

                    const { id, ...batchToSave } = batch

                    let productIndex = batchToSave.products.findIndex(p => {
                        return p.productId === out.productId &&
                            p.flavour === out.flavour
                    })

                    if (productIndex === -1) {
                        throw new Error("product not found on inventory")
                    }

                    batchToSave.products[productIndex].qty -= out.qty
                    batchToSave.products[productIndex].qtyOut += out.qty

                    let invOutToSave = {
                        saleId: saleId,
                        inventoryId: out.inventoryId,
                        warehouseId: batch.warehouseId,
                        concept: "Venta",
                        productId: out.productId,
                        flavour: out.flavour,
                        qty: out.qty
                    }

                    let invOutPromise = db.collection("inventoryOut")
                        .add(invOutToSave)

                    let invUpdatePromise = db.collection("inventory")
                        .doc(batch.id)
                        .update(batchToSave)

                    promises.push(invOutPromise)
                    promises.push(invUpdatePromise)
                })
            }

            if (data.diffCommission && data.distributorId) {
                let diffCommissionToSave = {
                    clientId: data.distributorId,
                    saleId: saleId,
                    concept: "Utilidad Diferencial",
                    commission: data.diffCommission,
                    date: data.date
                }

                let cc1Promise = db.collection('clientCommission')
                    .add(diffCommissionToSave)

                promises.push(cc1Promise)
            }

            if (data.level1Commission && data.level1DistributorId) {
                let level1CommissionToSave = {
                    clientId: data.level1DistributorId,
                    saleId: saleId,
                    concept: "Comisión Nivel 1",
                    commission: data.level1Commission,
                    date: data.date
                }

                let cc2Promise = db.collection('clientCommission')
                    .add(level1CommissionToSave)

                promises.push(cc2Promise)
            }

            if (data.level2Commission && data.level2DistributorId) {
                let level2CommissionToSave = {
                    clientId: data.level2DistributorId,
                    saleId: saleId,
                    concept: "Comisión Nivel 2",
                    commission: data.level2Commission,
                    date: data.date
                }

                let cc3Promise = db.collection('clientCommission')
                    .add(level2CommissionToSave)

                promises.push(cc3Promise)
            }

            if (data.vendorCommission) {
                let vendorCommissionToSave = {
                    vendorId: data.vendorToCommission,
                    saleId: saleId,
                    concept: "Venta",
                    commission: data.vendorCommission,
                    date: data.date,
                    status: "Pendiente"
                }

                let vendorCommissionPromise = db.collection('vendorCommission')
                    .add(vendorCommissionToSave)

                promises.push(vendorCommissionPromise)
            }

            if (data.commissionApplied) {
                let clientCommissionToSave = {
                    clientId: data.buyerId,
                    saleId: saleId,
                    concept: "Comisión Aplicada",
                    commission: -(data.commissionApplied),
                    date: data.date
                }

                let commissionAppliedPromise = db.collection('clientCommission')
                    .add(clientCommissionToSave)

                promises.push(commissionAppliedPromise)
            }

            let deliveredPromise;

            let currDate = firebase.firestore.Timestamp.fromDate(new Date())

            if (data.delivered) {
                let deliverToSave = {
                    saleDate: data.date,
                    status: "Entregado",
                    address: data.address,
                    delivery_method: "Entrega Personal",
                    recievedDate: currDate,
                    sendDate: currDate,
                    saleId: saleId,
                    clientId: data.clientId,
                    products: data.products
                }

                deliveredPromise = db.collection('delivery')
                    .add(deliverToSave)
            }
            else {
                let deliverToSave = {
                    saleDate: data.date,
                    status: "Pendiente",
                    address: data.address,
                    saleId: saleId,
                    clientId: data.clientId,
                    products: data.products
                }

                deliveredPromise = db.collection('delivery')
                    .add(deliverToSave)
            }

            promises.push(deliveredPromise)

            return Promise.all(promises)
                .then(() => {
                    return data
                })
                .catch((error) => {
                    throw new Error(error)
                })
        }
        catch (error) {
            throw new Error(error)
        }
    }

    const getInventoryInformation = (products) =>
        new Promise((resolve) => {
            let infoResult = {}

            infoResult.cost = 0
            infoResult.invOut = []

            products.forEach(product => {
                let productLeft = product.qty

                warehouseInventoryData.forEach(batch => {
                    if (productLeft > 0) {
                        let productIndex =
                            batch.products.findIndex(p => p.productId === product.productId &&
                                p.flavour === product.flavour)

                        if (productIndex > -1) {
                            let prodInventory = batch.products[productIndex]
                            let outQty = 0

                            if (prodInventory.qty >= product.qty) {
                                outQty = product.qty
                            }
                            else {
                                outQty = product.qty - prodInventory.qty
                            }

                            infoResult.invOut.push({
                                warehouseId: batch.warehouseId,
                                inventoryId: batch.inventoryInId,
                                concept: "VENTA",
                                flavour: product.flavour,
                                productId: product.productId,
                                qty: outQty
                            })

                            productLeft -= outQty
                            infoResult.cost += prodInventory.cost * outQty
                        }
                    }
                })
            })

            resolve(infoResult)
        })

    const getVendor = async (vendorId) => {
        return new Promise((resolve, reject) => {
            let vendor = vendorData.find(v => v.value === vendorId)

            if (!vendor) {
                reject(`vendor with id '${vendorId}' not found`)
            }

            resolve(vendor)
        })
    }

    const getAddress = async (client, addressIndex) => {
        return new Promise((resolve, reject) => {
            if (!(addressIndex >= 0) || !client.addresses || !client.addresses[addressIndex]) {
                reject("address not found for client")
            }

            resolve(client.addresses[addressIndex])
        })
    }

    const getClient = async (clientId) => {
        return new Promise((resolve, reject) => {
            let client = clientData.find(c => c.value === clientId)

            if (!client) {
                reject(`client with id "${clientId}" not found`)
            }

            resolve(client)
        })
    }

    const getLevel1Distributor = async (client) => {
        return new Promise((resolve, reject) => {
            if (!client.recommendedDistributorId) {
                resolve(null)
            }

            let distributor = clientData.find(c => c.value === client.recommendedDistributorId)

            if (client.distributor) {
                distributor = clientData.find(c => c.value === client.recommendedDistributorId)
                resolve(distributor)
            } else if (!distributor.recommendedDistributorId) {
                resolve(null)
            }
            else {
                let distFromDistributor = clientData.find(c => c.value === distributor.recommendedDistributorId)
                return resolve(distFromDistributor)
            }

            reject("Invalid logic for commission")
        })
    }

    const getLevel2Distributor = async (level1DistributorId) => {
        return new Promise((resolve) => {
            let level1Distributor = clientData.find(c => c.value === level1DistributorId)

            if (!level1Distributor || !level1Distributor.recommendedDistributorId) {
                resolve(null)
            }

            let level2Distributor = clientData.find(c => c.value === level1Distributor.recommendedDistributorId)

            resolve(level2Distributor)
        })
    }

    const castPrice = async (products) => {
        return new Promise((resolve) => {
            products.forEach(p => {
                p.price = parseFloat(p.price)
            })

            resolve(products)
        })
    }

    const getDiffCommission = async (client, buyerId, priceTypeId, products) => {
        return new Promise((resolve, reject) => {
            let commission = 0

            if (!client.recommendedDistributorId) {
                resolve(0)
            }

            if (client.value !== buyerId) {
                resolve(0)
            }

            let publicPriceType = priceTypeData.find(p => p.level === 1)
            let distributorPriceType = priceTypeData.find(p => p.level === 2)

            if (!publicPriceType) {
                reject("'Precio Publico' not found")
            }
            if (!distributorPriceType) {
                reject("'Precio Distribuidor' not found")
            }
            if (priceTypeId !== publicPriceType.id) {
                resolve(0)
            }

            commission = products.reduce((accum, curr) => {
                let product = productData.find(p => p.value === curr.productId)

                if (!product) {
                    reject(`product "${curr.productId}" not found.`)
                }

                let productDistPrice = product.prices.find(p => p.priceTypeId === distributorPriceType.id)

                if (productDistPrice) {
                    if (productDistPrice.price < curr.price) {
                        let adjustment = curr.price - productDistPrice.price
                        return accum += (adjustment * curr.qty)
                    }
                }

                return accum
            }, 0)

            resolve(commission)
        })
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    const handleCancelClick = () => {
        history.push("/sale")
    }

    const handleNextButtonClick = async () => {
        let triggerResult = true
        let hasManualError = false

        if (activeStep === 0) {
            triggerResult =
                await trigger(["date", "vendorId", "clientId", "buyerId", "warehouseId", "deliveryCost", "addressIndex"])
        }

        if (activeStep === 1) {
            console.log("validate: ", watchProducts)
            triggerResult = await trigger(["products"])
            for (let i = 0; i < watchProducts.length; i++) {
                let currProduct = watchProducts[i];
                let currQty = parseInt(currProduct.qty)
                if (currProduct.available < currQty) {
                    setError(`products.${i}.qty`,
                        { type: "invalid", message: "Falta Producto en Almacen" });

                    hasManualError = true
                }

                if (currProduct.productId.flavours && currProduct.productId.flavours.length > 0) {
                    if (!currProduct.flavour) {
                        setError(`products.${i}.flavour`,
                            { type: "required", message: "La versión es requerida" });

                        hasManualError = true
                    }
                }
            }
        }

        if (triggerResult && !hasManualError) {
            setActiveStep(activeStep + 1)
        }
    }

    const handleBackButtonClick = () => {
        setActiveStep(activeStep - 1)
    }

    useEffect(() => {
        trackPromise(
            db.collection("vendor")
                .orderBy("firstName")
                .get()
                .then((result) => {
                    let vendors = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        vendors.push({
                            value: doc.id,
                            label: `${docData.firstName} ${docData.lastName}`,
                            render: `${docData.firstName} ${docData.lastName}`,
                            ...docData
                        })
                    })
                    setVendorData(vendors)
                })
                .catch((error) => {
                    console.error("Error retrieving vendors: ", error)
                }))
    }, [])

    useEffect(() => {
        trackPromise(
            db.collection("warehouse")
                .orderBy("name")
                .get()
                .then((result) => {
                    let warehouses = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        warehouses.push({
                            value: doc.id,
                            label: docData.name,
                            render: docData.name,
                            ...docData
                        })
                    })
                    setWarehouseData(warehouses)
                })
                .catch((error) => {
                    console.error("Error retrieving warehouse: ", error)
                }))
    }, [])

    useEffect(() => {
        const getNumberfromPhone = (phone) => {
            return phone.replace(/\D/g, "")
        }

        const unsubscribe =
            db.collection("client")
                .orderBy("firstName")
                .onSnapshot((snapShot) => {
                    let clients = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        clients.push({
                            value: doc.id,
                            render: `${docData.firstName} ${docData.lastName} - ${docData.phone}`,
                            label: `${docData.firstName} ${docData.lastName} - ${getNumberfromPhone(docData.phone)}`,
                            ...docData
                        })
                    })
                    setClientData(clients)
                }, (error) => {
                    console.error("Unable to subscribe to clients, error: ", error)
                })
        return (unsubscribe)
    }, [])

    useEffect(() => {
        trackPromise(
            db.collection("priceType")
                .orderBy("name")
                .get()
                .then((result) => {
                    let priceTypes = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        priceTypes.push({
                            id: doc.id,
                            ...docData
                        })
                    })
                    setPriceTypeData(priceTypes)
                })
                .catch((error) => {
                    console.error("Error retrieving priceTypes: ", error)
                }))
    }, [])

    useEffect(() => {
        trackPromise(
            db.collection("product")
                .orderBy("name")
                .get()
                .then((result) => {
                    let products = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        products.push({
                            value: doc.id,
                            render: docData.name,
                            label: docData.name,
                            ...docData
                        })
                    })
                    setProductData(products)
                })
                .catch((error) => {
                    console.error("Error retrieving products: ", error)
                }))
    }, [])

    useEffect(() => {
        trackPromise(
            db.collection("paymentType")
                .orderBy("order")
                .get()
                .then((result) => {
                    let paymentTypes = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        paymentTypes.push({
                            value: doc.id,
                            render: docData.name,
                            label: docData.name,
                            ...docData
                        })
                    })
                    setPaymentTypeData(paymentTypes)
                })
                .catch((error) => {
                    console.error("Error retrieving paymentTypes: ", error)
                }))
    }, [])

    useEffect(() => {
        db.collection("bankAccount")
            .orderBy("order")
            .get()
            .then((result) => {
                let bankAccounts = []
                result.forEach((doc) => {
                    let docData = doc.data()
                    let bank = bankData.find(bank => bank.id === docData.bankId)
                    let label = `${bank ? bank.name : "error"} : ${docData.account}`
                    bankAccounts.push({ ...docData, id: doc.id, value: doc.id, label: label, render: label })
                })
                setBankAccountData(bankAccounts)
            }).catch((error) => {
                console.error("Unable to subscribe to bankAccounts, error: ", error)
            })
    }, [bankData])

    useEffect(() => {
        db.collection("bank")
            .get()
            .then((result) => {
                let banks = []
                result.forEach((doc) => {
                    let docData = doc.data()
                    banks.push({
                        id: doc.id,
                        ...docData
                    })
                })
                setBankData(banks)
            })
            .catch((error) => {
                console.error("Error retrieving banks: ", error)
            })
    }, [])

    useEffect(() => {
        if (watchClientId) {
            db.collection('clientCommission')
                .where("clientId", "==", watchClientId.value)
                .get()
                .then((result) => {
                    let clientCommissions = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        clientCommissions.push({
                            id: doc.id,
                            ...docData
                        })
                    })
                    setClientCommissionData(clientCommissions)
                })
                .catch((error) => {
                    console.error("Error retrieving clientCommission: ", error)
                })
        }
    }, [watchClientId])

    useEffect(() => {
        if (watchWarehouseId) {
            db.collection("inventory")
                .where("warehouseId", "==", watchWarehouseId.value)
                .orderBy("date")
                .get()
                .then((result) => {
                    let warehouseInventory = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        warehouseInventory.push({
                            id: doc.id,
                            ...docData
                        })
                    })
                    setWarehouseInventoryData(warehouseInventory)
                })
                .catch((error) => {
                    console.error("Error retrieving inventory: ", error)
                })
        }
    }, [watchWarehouseId])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <FormPageLayout title="Agregar Venta">
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit, onError)} id="add-sale-form">
                    {(errors && errors.save) &&
                        <React.Fragment>
                            <Alert severity="error">
                                {errors.save.message}
                            </Alert>
                            <br />
                            <br />
                        </React.Fragment>
                    }
                    <Stepper activeStep={activeStep}
                        style={{ backgroundColor: "transparent" }}>
                        <Step key={0} completed={activeStep > 0} active={activeStep === 0}>
                            <StepLabel>
                                Información General
                            </StepLabel>
                        </Step>
                        <Step key={1} completed={activeStep > 1} active={activeStep === 1}>
                            <StepLabel>
                                Productos
                            </StepLabel>
                        </Step>
                        <Step key={2} completed={activeStep > 2} active={activeStep === 2}>
                            <StepLabel>
                                Pago
                            </StepLabel>
                        </Step>
                    </Stepper>
                    <Box minHeight="450px" marginBottom="40px" marginTop="30px">
                        {activeStep === 0 &&
                            <GeneralInfoForm
                                vendorData={vendorData}
                                clientData={clientData}
                                warehouseData={warehouseData} />
                        }
                        {activeStep === 1 &&
                            <ProductInfoForm
                                schema={productSchema}
                                productData={productData}
                                priceTypeData={priceTypeData}
                                warehouseInventoryData={warehouseInventoryData}
                                clientData={clientData} />
                        }
                        {activeStep === 2 &&
                            <PaymentInfoForm
                                bankAccountData={bankAccountData}
                                paymentTypeData={paymentTypeData}
                                clientCommissionData={clientCommissionData} />
                        }
                    </Box>
                    <Box display="flex" justifyContent="flex-end" marginBottom="40px">
                        <Box display="flex" justifyContent="space-between" width="380px">
                            <Button
                                variant="contained"
                                onClick={() => handleCancelClick()}
                                style={{ width: "110px" }}>
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => handleBackButtonClick()}
                                disabled={activeStep === 0}
                                style={{ width: "110px" }}>
                                Atras
                            </Button>
                            {activeStep !== 2 &&
                                <Button
                                    variant="contained"
                                    onClick={() => handleNextButtonClick()}>
                                    Siguiente
                                </Button>}
                            {activeStep === 2 &&
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting}>
                                    Guardar
                                </Button>}
                        </Box>
                    </Box>
                </form>
            </FormProvider>
        </FormPageLayout>
    )
}

export default SaleAddPage
