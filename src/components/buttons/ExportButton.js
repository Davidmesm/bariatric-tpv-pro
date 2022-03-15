import { Button } from "@material-ui/core"
import { GetApp } from "@material-ui/icons"
import { CSVLink } from "react-csv"
import React from "react"

const ExportButton = (props) => {

    const { data, headers, disabled, filename } = props

    return (
        <Button
            variant="outlined"
            color="secondary"
            component={CSVLink}
            startIcon={< GetApp />}
            data={data}
            disabled={disabled}
            filename={filename ? filename : "Download.csv"}
            headers={headers}
            {...props}>
            Exportar
        </Button>
    )
}

export default ExportButton
