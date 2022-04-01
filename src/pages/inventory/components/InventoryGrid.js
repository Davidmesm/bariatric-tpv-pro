import { Box, IconButton } from "@material-ui/core"
import { DataGrid } from "@material-ui/data-grid"
import { ImportExport } from "@material-ui/icons";
import React, { useEffect, useState } from "react"
import { db } from "../../../firebase";

const InventoryGrid = (props) => {

    const { warehouse, productData, setValue, setOpenTransferDialog, reset } = props;

    const [inventoryData, setInventoryData] = useState([])

    const handleTransferClick = (id) => {
        let productInfo = inventoryData.find(productInfo => productInfo.id === id);

        reset()

        setValue("productId", { value: productInfo.productId, label: productInfo.productName, render: productInfo.productName })
        setValue("flavour", productInfo.flavour ?? "")
        setValue("originWarehouseId", warehouse)
        setValue("originQty", productInfo.qty)

        setOpenTransferDialog(true)
    }

    const columns = [
        {
            field: "id",
            headerName: " ",
            width: 80,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        aria-label="editar"
                        onClick={() => handleTransferClick(params.value)}
                        color="primary"
                        disabled={!warehouse.value}
                    >
                        <ImportExport />
                    </IconButton>
                </Box>
            )
        },
        { field: "productName", headerName: "Producto", flex: 1 },
        { field: "flavour", headerName: "Versión", width: 200 },
        { field: "qty", headerName: "Disponible", width: 150 }];

    useEffect(() => {
        const processBatch = (invBatches) => {
            invBatches = invBatches.filter(batch => {
                let batchProducts = batch.products.filter(invProd => invProd.qty != 0)
                return batchProducts.length > 0
            })

            let data = []
            invBatches.forEach(batch =>
                batch.products.forEach(batchProduct => {
                    let dataProductIndex = data.findIndex(p => p.productId === batchProduct.productId && (p.flavour ?? "") === (batchProduct.flavour ?? ""))

                    if (dataProductIndex === -1) {
                        const { cost, qtyIn, qtyOut, ...productToAdd } = batchProduct;
                        productToAdd.id = data.length + 1

                        let productInfo = productData.find(product => product.id === batchProduct.productId);

                        if (productInfo) {
                            productToAdd.productName = productInfo.name;
                            data = [...data, productToAdd]
                        }
                    }
                    else {
                        let dataRow = data[dataProductIndex];
                        dataRow.qty = dataRow.qty + batchProduct.qty;
                    }
                }))

            setInventoryData(data)
        }

        const unsubscribe = warehouse.value ?
            db.collection("inventory")
                .where('warehouseId', '==', warehouse.value)
                .orderBy("date")
                .onSnapshot((snapShot) => {
                    let invBatch = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        invBatch.push({ id: doc.id, ...docData })
                    })

                    processBatch(invBatch)

                }, (error) => {
                    console.error("Unable to subscribe to inventory, error: ", error)
                })
            : db.collection("inventory")
                .orderBy("date")
                .onSnapshot((snapShot) => {
                    let invBatch = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        invBatch.push({ id: doc.id, ...docData })
                    })

                    processBatch(invBatch)

                }, (error) => {
                    console.error("Unable to subscribe to inventory, error: ", error)
                })

        return unsubscribe
    }, [warehouse, setInventoryData, productData])

    return (
        <Box height="400px">
            <Box display="flex" height="100%">
                <Box flexGrow={1}>
                    <DataGrid
                        rows={inventoryData}
                        columns={columns}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default InventoryGrid
