import React, { useEffect, useState } from "react"
import { Box } from "@material-ui/core"
import { DataGrid } from "@material-ui/data-grid"
import { db } from "../../../firebase"

const InventoryOutGrid = (props) => {
    const { warehouse, productData } = props

    const [inventoryOutData, setInventoryOutData] = useState([])

    const columns = [
        { field: "date", headerName: "Fecha", width: 250, type: "date" },
        { field: "inventoryId", headerName: "Clave Compra", width: 250 },
        { field: "saleId", headerName: "Venta", width: 200 },
        { field: "productName", headerName: "Producto", flex: 1 },
        { field: "flavour", headerName: "Versión", width: 150 },
        { field: "qty", headerName: "Cantidad", width: 140 }]

    useEffect(() => {
        const unsubscribe = warehouse.value ?
            db.collection("inventoryOut")
                .where("warehouseId", "==", warehouse.value)
                .orderBy("date")
                .onSnapshot((snapShot) => {
                    let invBatch = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data()
                        docData.date = docData.date.toDate()
                        invBatch.push({ id: doc.id, ...docData })
                    })

                    let data = invBatch.map(inventoryBatch => {
                        let productInfo = productData.find(row => row.id === inventoryBatch.productId)
                        inventoryBatch.productName = productInfo ? productInfo.name : "Error"
                        return inventoryBatch
                    })

                    setInventoryOutData(data)

                }, (error) => {
                    console.error("Unable to subscribe to inventoryOut, error: ", error)
                })
            : db.collection("inventoryOut")
                .orderBy("date")
                .onSnapshot((snapShot) => {
                    let invBatch = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data()
                        docData.date = docData.date.toDate()
                        invBatch.push({ id: doc.id, ...docData })
                    })

                    let data = invBatch.map(inventoryBatch => {
                        let productInfo = productData.find(row => row.id === inventoryBatch.productId)
                        inventoryBatch.productName = productInfo ? productInfo.name : "Error"
                        return inventoryBatch
                    })

                    setInventoryOutData(data)

                }, (error) => {
                    console.error("Unable to subscribe to inventoryOut, error: ", error)
                })

        return unsubscribe
    }, [warehouse, setInventoryOutData, productData])

    return (
        <Box>
            <Box height="400px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={inventoryOutData}
                            columns={columns}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default InventoryOutGrid
