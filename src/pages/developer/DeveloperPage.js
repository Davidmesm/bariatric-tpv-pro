import React, { useEffect, useState } from 'react'
import { db } from "../../firebase"

const DeveloperPage = () => {
    const [result, setResult] = useState()

    useEffect(() => {
         db.collection('delivery').get().then(querySnapshot => {
            let temp = []

            querySnapshot.forEach(doc => {
                let data = doc.data()
                let parcelService = data.parcelService

                if(parcelService && parcelService.toLowerCase() === "pau")
                {
                    data.parcelService = "xHChvx2P9xj81kAgzN7A"

                    db.collection('delivery').doc(doc.id).update(data).then(() => {
                        console.log("delivery updated: ", doc.id)
                    })
                    .catch(error => {
                        console.error("error updating delivery: ", error)
                    })
                }

                temp.push({id: doc.id, ...data})
            })

            console.log("end")

            setResult(temp)
        }).catch(error => console.error(error))
    
    }, [])
    

    if(!result)
        return (<div>Loading</div>)

  return (
    <div>
        {result.map(item => (
            <div key={item.id}>
                <br/>
                <br/>
                <div>{item.parcelService}</div>
            </div>
        ))}
    </div>
  )
}

export default DeveloperPage