import React, { useState } from "react"
import DateFnsUtils from "@date-io/date-fns"
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
  } from "@material-ui/pickers"
import { useController } from "react-hook-form"

const DateFieldInput = ( props ) => {

    const {
        name, 
        label,
        control,
        fullWidth,
        onChange,
        disabled
        } = props

    const { field, fieldState } = useController({name, control, defaultValue: new Date(Date.now())})

    const handleOnChange = (e) => {
        onChange && onChange(e);
        field.onChange(e);
    }

    const [pickerStatus, setPickerStatus] = useState(false)

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="dd/MM/yyyy"
                margin="normal"
                id="date-picker-inline"
                label={label}
                disabled={disabled}
                fullWidth={fullWidth}
                defaultValue={field.defaultValue}
                autoOk
                onChange={(e) => handleOnChange(e)} 
                onBlur={(e) => field.onBlur(e)}
                ref={field.ref}
                value={field.value}
                error={!!fieldState.error}
                helperText={fieldState.error ? fieldState.error.message : null}
                KeyboardButtonProps={{
                    'aria-label': 'change date',
                }}/>
        </MuiPickersUtilsProvider>
    )
}

export default DateFieldInput
