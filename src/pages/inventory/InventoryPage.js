import { Box, Button, ButtonGroup } from "@material-ui/core"
import { AddShoppingCart } from "@material-ui/icons"
import React, { useEffect, useState } from "react"
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import { useHistory, useRouteMatch } from "react-router"
import { db } from "../../firebase"
import * as yup from "yup"
import { yupResolver } from '@hookform/resolvers/yup'
import InventoryPageLayout from "./components/InventoryPageLayout"
import InventoryGrid from "./components/InventoryGrid"
import InventoryInGrid from "./components/InventoryInGrid"
import InventoryOutGrid from "./components/InventoryOutGrid"
import Loading from "../../components/Loading"
import DeleteDialog from "../../components/dialogs/DeleteDialog"
import { useAlerts } from "../../contexts/AlertsContext"
import { useForm } from "react-hook-form"
import TransferDialog from "./components/TransferDialog"

const schema = yup.object().shape({
    originWarehouseId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required().default(""),
    targetWarehouseId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Almacen Destin requerido").default(""),
    productId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required().default(""),
    originQty: yup.number().transform((value => isNaN(value) ? undefined : value))
        .required()
        .default(0),
    transferQty: yup.number().transform((value => isNaN(value) ? undefined : value))
        .required("Cantidad/Destino requerida")
        .when("originQty", (originQty) => {
            return yup.number().max(originQty, "La cantidad no puede exceder la 'Cantidad/Origen'")
        })
        .default(0)
})

const InventoryPage = () => {

    const history = useHistory();
    let { path } = useRouteMatch();
    const { promiseInProgress } = usePromiseTracker();
    const { createAlert } = useAlerts()

    const { control, handleSubmit, setValue, watch, reset,
        formState: { errors, isSubmitting } } =
        useForm({
            resolver: yupResolver(schema),
            defaultValues: schema.cast()
        })

    const [warehouseOptions, setWarehouseOptions] = useState([])
    const [warehouseValue, setWarehouseValue] = useState({ value: "", label: "", render: "" })
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [currentGrid, setCurrentGrid] = useState(0)
    const [productData, setProductData] = useState([])
    const [openTransferDialog, setOpenTransferDialog] = useState(false)
    const [optionsWH, setOptionsWH] = useState([])

    const confirmDeleteClick = () => {
        setOpenDeleteDialog(false);

        let idToDelete = warehouseValue.value

        db.collection('warehouse')
            .doc(idToDelete)
            .delete()
            .then(() => {
                setWarehouseValue({ value: "", label: "", render: "" })
                createAlert("success", "Almacen eliminado.")
                console.log("Deleted warehouse document: ", idToDelete);
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar almacen")
                console.error("Error deleting waregouse document: ", error);
            });
    }

    const originWarehouseWatch = watch("originWarehouseId", { value: "", label: "", render: "" });

    useEffect(() => {
        const unsubscribe =
            db.collection('warehouse')
                .orderBy("name")
                .onSnapshot((snapShot) => {
                    let warehouses = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        warehouses.push({ value: doc.id, label: docData.name, render: docData.name })
                    })
                    setWarehouseOptions(warehouses);
                }, (error) => {
                    console.error("Unable to subscribe to warehouses, error: ", error)
                })

        return unsubscribe;
    }, [])

    useEffect(() => {
        trackPromise(
            db.collection("product")
                .get()
                .then((result) => {
                    let products = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        products.push({ id: doc.id, ...docData })
                    })
                    setProductData(products)
                })
                .catch((error) => {
                    console.error("Error retrieving products: ", error)
                }))
    }, [])

    useEffect(() => {
        let options = [];

        warehouseOptions.forEach(warehouseOption => {
            if (warehouseOption.value !== originWarehouseWatch.value) {
                options = [...options, warehouseOption]
            }
        })
        setOptionsWH(options);
    }, [originWarehouseWatch, warehouseOptions])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <InventoryPageLayout
            warehouseOptions={warehouseOptions}
            warehouseValue={warehouseValue}
            setWarehouseValue={setWarehouseValue}
            setOpenDeleteDialog={setOpenDeleteDialog}>
            <Box paddingTop={3} width="100%">
                <Box width="100%" display="flex" justifyContent="space-between">
                    <Box>
                        <ButtonGroup color="secondary" aria-label="large outlined secondary button group">
                            <Button onClick={() => setCurrentGrid(0)}>
                                Inventario
                            </Button>
                            <Button onClick={() => setCurrentGrid(1)}>
                                Entradas
                            </Button>
                            <Button onClick={() => setCurrentGrid(2)}>
                                Salidas
                            </Button>
                        </ButtonGroup>
                    </Box>
                    <Box display="flex" width="300px" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            color="primary"
                            disabled={!warehouseValue || !warehouseValue.value}
                            onClick={() => history.push(`${path}/warehouse/${warehouseValue.value}/buy`)}
                            startIcon={<AddShoppingCart />}>
                            Comprar
                        </Button>
                    </Box>
                </Box>
                <br />
                <br />
                <br />
                {currentGrid === 0 &&
                    <InventoryGrid
                        warehouse={warehouseValue}
                        productData={productData}
                        warehouseOptions={warehouseOptions}
                        setValue={setValue}
                        setOpenTransferDialog={setOpenTransferDialog}
                        reset={reset}
                    />}
                {currentGrid === 1 &&
                    <InventoryInGrid
                        warehouse={warehouseValue}
                        productData={productData} />}
                {currentGrid === 2 &&
                    <InventoryOutGrid
                        warehouse={warehouseValue}
                        productData={productData} />}
            </Box>
            <DeleteDialog
                setOpenDialog={setOpenDeleteDialog}
                openDialog={openDeleteDialog}
                idToDelete={warehouseValue && warehouseValue.value}
                entityTitle="Almacen"
                confirmDeleteClick={confirmDeleteClick} />
            <TransferDialog
                control={control}
                errors={errors}
                setValue={setValue}
                warehouseOptions={warehouseOptions}
                openTransferDialog={openTransferDialog}
                setOpenTransferDialog={setOpenTransferDialog}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                optionsWH={optionsWH} />
        </InventoryPageLayout>
    )
}

export default InventoryPage
