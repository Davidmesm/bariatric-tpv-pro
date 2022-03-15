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
import ViewFlavourDialog from "./components/ViewFlavourDialog"
import Loading from "../../components/Loading";

const ProductPage = () => {
    const history = useHistory()
    let { url } = useRouteMatch()
    const { promiseInProgress } = usePromiseTracker()
    const { createAlert } = useAlerts()

    const [productData, setProductData] = useState([])
    const [priceTypeData, setPriceTypeData] = useState([])
    const [columns, setColumns] = useState([])
    const [exportHeaders, setExportHeaders] = useState([])
    const [exportData, setExportData] = useState([])
    const [flavours, setFlavours] = useState([])
    const [idToDelete, setIdToDelete] = useState()
    const [deleteOpenDialog, setDeleteOpenDialog] = useState(false)
    const [openFlavourDialog, setOpenFlavourDialog] = useState(false)

    const addFunction = (e) => {
        history.push("/product/add")
    }

    const handleDeleteClick = (id) => {
        setIdToDelete(id);
        setDeleteOpenDialog(true);
    }

    const confirmDeleteClick = () => {
        setDeleteOpenDialog(false);

        db.collection('product')
            .doc(idToDelete)
            .delete()
            .then(() => {
                createAlert("success", "Producto eliminado.")
                console.log("Deleted product document: ", idToDelete);
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar producto")
                console.error("Error deleting product document: ", error);
            });
    }

    const handleClickFlavours = (flavours) => {
        setFlavours(flavours);
        setOpenFlavourDialog(true);
    }

    useEffect(() => {
        trackPromise(
            db.collection("priceType")
                .orderBy("level")
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
                    return []
                }))
    }, [])

    useEffect(() => {
        const unsubscribe =
            db.collection("product")
                .orderBy("name")
                .onSnapshot((snapShot) => {
                    let products = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();

                        let product = { ...docData, id: doc.id }

                        if (docData.prices) {
                            docData.prices.forEach(p => {
                                let priceType = priceTypeData ? priceTypeData.find(pt => pt.id === p.priceTypeId) : []
                                if (priceType) {
                                    product[priceType.id] = `$${parseFloat(p.price).toFixed(2)}`
                                }
                            })
                        }

                        products.push(product)
                    })

                    setProductData(products);
                }, (error) => {
                    console.error("Unable to subscribe to product, error: ", error)
                })

        return unsubscribe;
    }, [setProductData, priceTypeData])

    useEffect(() => {
        const handleEditClick = (id) => history.push(`${url}/edit/${id}`);

        const getHeadersAndData = () =>
            new Promise((resolve) => {
                let columns = [
                    {
                        field: "id",
                        headerName: " ",
                        width: 140,
                        renderCell: (params) => (
                            <Box>
                                <IconButton
                                    aria-label="editar"
                                    onClick={(e) => handleEditClick(params.value)}
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
                    { field: "name", headerName: "Producto", width: 280 },
                    {
                        field: "flavours",
                        headerName: "Versiones",
                        width: 180,
                        renderCell: (params) => (
                            <>
                                {(params.value.length) > 0 &&
                                    <IconButton aria-label="ver" onClick={() => handleClickFlavours(params.value)}>
                                        <Visibility />
                                    </IconButton>}
                            </>
                        )
                    }
                ];

                priceTypeData.forEach(priceType => {
                    columns = [...columns, { field: priceType.id, headerName: priceType.name, width: 200 }]
                });

                let headers = columns.map(column => {
                    if (column.field === "id") {
                        return { label: "Id", key: column.field }
                    }

                    return { label: column.headerName, key: column.field }
                })

                let flavourIndex = headers.findIndex(column => column.key === "flavours");

                if (flavourIndex >= 0) {
                    headers.splice(flavourIndex, 1)
                }

                let data = productData.map(product => {
                    const { prices, flavours, ...productToExport } = product

                    return productToExport
                })

                setColumns(columns)
                setExportHeaders(headers)
                setExportData(data)
                resolve()
            })

        trackPromise(
            getHeadersAndData()
        )
    }, [priceTypeData, productData, setColumns, setExportHeaders, setExportData, history, url])


    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <PageLayout
            title="Productos"
            data={exportData}
            headers={exportHeaders}
            addFunction={addFunction}>
            <Box height="400px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={productData}
                            columns={columns} />
                    </Box>
                </Box>
            </Box>
            <ViewFlavourDialog
                open={openFlavourDialog}
                setOpen={setOpenFlavourDialog}
                flavours={flavours} />
            <DeleteDialog
                setOpenDialog={setDeleteOpenDialog}
                openDialog={deleteOpenDialog}
                idToDelete={idToDelete}
                entityTitle="Vendedor"
                confirmDeleteClick={confirmDeleteClick} />
        </PageLayout>
    )
}

export default ProductPage
