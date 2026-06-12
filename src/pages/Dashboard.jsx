import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase.js";

function DashboardPage(){

    const [requests, setRequests] = useState([])

    useEffect(() => {
        const q =query(collection(db,"requests"), orderBy("createdAt","desc"))

        const unsubscribe = onSnapshot(q , (snapshot) => {
            const requests = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
         setRequests(requests)
        })
     return unsubscribe
    }, [])

    async function handleClearAll(){
        const confirmed = confirm("Are you sure you want to clear all requests?")
        if (!confirmed) {
            return
        }
        requests.forEach(async(request)=>{
            const requestId = request.id
            await deleteDoc(doc(db, "requests", requestId))
        }) 
    }

return(
    <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-purple-400">Escandalo! Dashboard</h1>
            <button
            onClick={()=>handleClearAll()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            >Clear All Requests
            </button>
        </div>
        <div className="grid gap-4">
        {requests.map((request) =>(
            <div  key={request.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-pink-400">{request.guestName}</h2>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${request.userChoice === "request" ? "bg-purple-600" : "bg-blue-600"}`}>
                        {request.userChoice === "request" ? "Song Request" : "Shout Out"}
                    </span> 
            </div>
            {request.userChoice === "request" && (
                <div className="mb-1">
                    <p>
                        <span className="text-gray-500 text-lg">Song: </span>
                        <span className="text-lg">{request.songName}</span>
                    </p>
                    <p>
                        <span className="text-gray-500 text-lg">Artist: </span>
                        <span className="text-lg">{request.artistName}</span>
                    </p>
                </div>
            
            )}
            {request.comment && (
            <p>
            <span className="text-gray-500 text-lg">Comment: </span>"{request.comment}"
            </p>
            )}
            <p className="text-xs text-gray-500">{request.createdAt?.toDate().toLocaleString()}</p>
            </div>
        ))}
        </div>
    </div>
    )
}

export default DashboardPage