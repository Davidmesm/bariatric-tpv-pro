import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core"
import React from "react"
import { Link } from "react-router-dom"

const CustomLink = (React.forwardRef((props, ref) => (
    <Link {...props} ref={ref}/>
)))

const MenuItem = (props) => {
    const { to, title, icon} = props

    return (
        <ListItem button component={CustomLink} to={to}>
            <ListItemIcon>
                {icon}
            </ListItemIcon>
            <ListItemText primary={title} />
        </ListItem>
    )
}

export default MenuItem
