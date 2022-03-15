import { Checkbox, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import React from 'react'

const VendorList = (props) => {

    const { vendorList, setVendorList } = props

    const handleToggle = (vendorId) => {
        let vList = [...vendorList]

        let vendorIndex = vList.findIndex(v => v.id === vendorId)

        if (vendorIndex >= 0) {
            vList[vendorIndex].checked = !vendorList[vendorIndex].checked
            setVendorList(vList)
        }
    }

    return (
        <List>
            {vendorList && vendorList.map(vendor => (
                <ListItem
                    onClick={() => handleToggle(vendor.id)}
                    key={vendor.id}
                    dense
                    button>
                    <ListItemIcon>
                        <Checkbox
                            edge="start"
                            checked={vendor.checked}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-labelledby': `checkbox-list-label-${vendor.id}` }} />
                    </ListItemIcon>
                    <ListItemText
                        id={`checkbox-list-label-${vendor.id}`}
                        primaryTypographyProps={{ variant: "h6" }}
                        primary={vendor.fullName} />
                </ListItem>

            ))}
        </List >
    )
}

export default VendorList
