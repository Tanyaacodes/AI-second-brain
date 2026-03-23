import { useState } from "react"
import axios from "axios"

function SaveKnowledge() {

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  const handleSave = async () => {

    try {

      await axios.post("http://localhost:5000/api/v1/knowledge/save", {
        title,
        url
      })

      alert("Knowledge Saved!")

      setTitle("")
      setUrl("")

    } catch (error) {
      console.log(error)
    }

  }

  return (

    <div style={{padding:"40px"}}>

      <h2>Save Knowledge</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
      />

      <br/><br/>

      <input
        type="text"
        placeholder="URL"
        value={url}
        onChange={(e)=>setUrl(e.target.value)}
      />

      <br/><br/>

      <button onClick={handleSave}>
        Save
      </button>

    </div>

  )

}

export default SaveKnowledge