import {useState,useEffect} from 'react'
import { collection, addDoc, serverTimestamp, onSnapshot  } from "firebase/firestore";
import { db } from "../firebase.js"

function GuestPage(){
    const [userChoice, setUserChoice] = useState('request')
    const [artistNameInput, setArtistNameInput] = useState('')
    const [songNameInput, setSongNameInput] = useState('')
    const [guestNameInput, setGuestNameInput] = useState('')
    const [commentInput, setCommentInput] = useState('')
    const [isSubmitted, setIsSubmitted] =useState(false)
    const [emptyInputError, setEmptyInputError] = useState("")
    const [requestsNum, setRequestsNum] = useState(0)

    async function handleSubmit(){
        if(guestNameInput === ""){
            setEmptyInputError("Your Name is Required")
            return
        }
        if(userChoice === "request" && songNameInput === ""){
            setEmptyInputError("Song Name Required")
            return
        }
        if(userChoice === "request" && artistNameInput === ""){
            setEmptyInputError("Artist Name Required")
            return
        }

        await addDoc(collection(db, "requests"), {
            artistName: artistNameInput,
            songName: songNameInput,
            guestName: guestNameInput,
            comment: commentInput,
            userChoice: userChoice,
            createdAt: serverTimestamp()
        })
        setIsSubmitted(true)
    }

    useEffect(() => {
            const unsubscribe = onSnapshot(collection(db,"requests"), (snapshot) => {
            const requestNum = snapshot.docs.length
             setRequestsNum(requestNum)
            })
         return unsubscribe
        }, [])


    return(
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-10">

       

        <h1 className="text-4xl font-bold text-center mb-2 text-purple-400">
            ESCANDALO! BY HEXX 
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
            Send a Song Request
        </p>
        
        {/* buttons for song request or shout out */}
        {isSubmitted === true ? (
            <div className="text-center mt-20">
                <p className="text-5xl mb-4">🎉</p>
                <h2 className="text-3xl font-bold text-purple-400 mb-6">Request Sent!</h2>
                <a className=" mb-4 block w-full text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl text-xl transition-all" 
        href="https://www.instagram.com/escandalolv/" target="_blank" >Follow Us On Instagram!</a>
                <p className="w-full block text-center bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-4 rounded-xl text-xl transition-all" >{requestsNum} Songs Requested Sent Tonight</p>
            </div>
        ) :(
        <>
        {/* Type selector */}
        <div className="flex gap-3 mb-8">
        <button 
        onClick={()=>setUserChoice("request")}
        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-colors ${
           userChoice === "request"
            ? "bg-purple-600 text-white"
            : "bg-gray-800 text-gray-400"
        }`}
        >Song Request
        </button >

        <button
        onClick={()=>setUserChoice("shoutout")}
        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-colors ${
            userChoice === "shoutout"
            ? "bg-pink-600 text-white"
            : "bg-gray-800 text-gray-400"
        }`}
        >Shout Out
        </button>
        </div>
        {/* input fields for song requests */}
        {userChoice === "request" && (
        <>
        <div className="mb-4">
            <label htmlFor='artistName' className="block text-sm text-gray-400 mb-1">Artist Name</label>
            <input
            className="block text-sm text-gray-400 mb-1"
            type="text"
            placeholder="e.g. Bad Bunny"
            value={artistNameInput}
            onChange={(e)=>setArtistNameInput(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
        </div>
        <div className="mb-4">
            <label htmlFor='songName' className="block text-sm text-gray-400 mb-1">Song Name</label>
            <input
            id="songName"
            type="text"
            placeholder="e.g. Tití Me Preguntó"
            value={songNameInput}
            onChange={(e)=>setSongNameInput(e.target.value)}
           className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            /> 
            </div>
        </> 
        )}
        {/* name and comment inputs */}
        <div  className="mb-4">
        <label htmlFor='guestName' className="block text-sm text-gray-400 mb-1">Your Name</label>
        <input
        id="guestName"
        type="text"
        placeholder="What's your name?"
        value={guestNameInput}
        onChange={(e)=>setGuestNameInput(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        </div>
        {/* Comment */}
        <div className="mb-6">
        <label htmlFor='commentField' className="block text-sm text-gray-400 mb-1">Comment (Birthday?, Wedding?)</label>
        <textarea
        id="commentField"
        placeholder="Any message for the DJ?" 
        value={commentInput}
        onChange={(e)=>setCommentInput(e.target.value)}
        rows="3"
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
        />
        </div>

        {/* Error */}
        {emptyInputError && (
            <p className="text-red-400 text-sm mb-4">{emptyInputError}</p>)}
        
        {/* TIP */}
        <div className="mb-6">
        <a className="w-full block text-center bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold py-4 rounded-xl text-xl transition-all" 
        href="https://cash.app/$escandalolv" target="_blank" >Tip the DJ</a>
        </div>

        {/* Submit */}
        <button
        onClick={()=>handleSubmit()}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl text-xl transition-all"
        >
        Submit Request 🎵
        </button>
        </>  
        )  
    }
    </div>
    )
}

export default GuestPage