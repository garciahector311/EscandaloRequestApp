import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase.js"

const GENRES = [
  { id: 'cumbia', label: 'Cumbia', emoji: '🥁', hint: 'Sonidera · Tropical · Norteño' },
  { id: 'regional', label: 'Regional', emoji: '🤠', hint: 'Quebradita · Zapateado' },
  { id: 'merengue', label: 'Merengue', emoji: '🎺', hint: 'La Vaca · Suavemente' },
  { id: 'reggaeton', label: 'Reggaeton', emoji: '🔥', hint: 'Bad Bunny · Perreo · Old School' },
  { id: 'english', label: 'English', emoji: '🎤', hint: 'Hip-Hop · Pop · EDM' },
]

const CASHAPP = "https://cash.app/$escandalolv"
const INSTAGRAM = "https://www.instagram.com/escandalolv/"
const VOTE_COOLDOWN_MS = 30 * 60 * 1000 // 30 minutes

function GuestPage() {
  // --- GENRE VOTE STATE ---
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [voteConfirmed, setVoteConfirmed] = useState(false)
  const [voteCooldown, setVoteCooldown] = useState(false)

  // --- SHOUTOUT STATE ---
  const [shoutName, setShoutName] = useState('')
  const [shoutMessage, setShoutMessage] = useState('')
  const [shoutTipped, setShoutTipped] = useState(false)
  const [shoutSubmitted, setShoutSubmitted] = useState(false)
  const [shoutError, setShoutError] = useState('')

  // --- SUGGESTION STATE ---
  const [suggestArtist, setSuggestArtist] = useState('')
  const [suggestSong, setSuggestSong] = useState('')
  const [suggestName, setSuggestName] = useState('')
  const [suggestSubmitted, setSuggestSubmitted] = useState(false)
  const [suggestError, setSuggestError] = useState('')

  // Check localStorage on load for vote cooldown
  useEffect(() => {
    const lastVote = localStorage.getItem('escandalo_last_vote')
    if (lastVote) {
      const elapsed = Date.now() - parseInt(lastVote)
      if (elapsed < VOTE_COOLDOWN_MS) {
        const savedGenre = localStorage.getItem('escandalo_voted_genre')
        setSelectedGenre(savedGenre)
        setVoteConfirmed(true)
        setVoteCooldown(true)
      }
    }
  }, [])

  // --- HANDLERS ---
  async function handleVote(genreId) {
    if (voteCooldown) return
    setSelectedGenre(genreId)
    await addDoc(collection(db, "votes"), {
      genre: genreId,
      createdAt: serverTimestamp()
    })
    localStorage.setItem('escandalo_last_vote', Date.now().toString())
    localStorage.setItem('escandalo_voted_genre', genreId)
    setVoteConfirmed(true)
    setVoteCooldown(true)
  }

function handleTipClick() {
    setShoutTipped(true)
    window.open(CASHAPP, '_blank', 'noopener')
  }

async function handleShoutSubmit() {
    if (!shoutName.trim()) { setShoutError('Your name is required'); return }
    if (!shoutMessage.trim()) { setShoutError('Message is required'); return }
    if (!shoutTipped) { setShoutError('Please send a tip first!'); return }
    setShoutError('')
    try {
      await addDoc(collection(db, "shoutouts"), {
        name: shoutName,
        message: shoutMessage,
        createdAt: serverTimestamp()
      })
      setShoutSubmitted(true)
    } catch (err) {
      setShoutError('Something went wrong: ' + err.message)
    }
  }

  async function handleSuggestSubmit() {
    if (!suggestArtist.trim()) { setSuggestError('Artist name is required'); return }
    if (!suggestSong.trim()) { setSuggestError('Song name is required'); return }
    if (!suggestName.trim()) { setSuggestError('Your name is required'); return }
    setSuggestError('')
    await addDoc(collection(db, "suggestions"), {
      artist: suggestArtist,
      song: suggestSong,
      name: suggestName,
      createdAt: serverTimestamp()
    })
    setSuggestSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-10">

      {/* HEADER */}
      <h1 className="text-4xl font-bold text-center mb-2 text-purple-400">ESCANDALO! BY HEXX</h1>
      <p className="text-center text-gray-500 mb-8 text-sm">Control the music tonight</p>

      {/* ── SECTION 1: GENRE VOTE ── */}
      <div className="w-full max-w-md mb-10">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Vote the vibe</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {GENRES.map((genre) => {
            const isWide = genre.id === 'english'
            const isSelected = selectedGenre === genre.id
            return (
              <button
                key={genre.id}
                onClick={() => handleVote(genre.id)}
                disabled={voteCooldown}
                className={`
                  ${isWide ? 'col-span-2' : ''}
                  rounded-xl py-4 px-3 text-center transition-all
                  ${isSelected
                    ? 'bg-green-900 border-2 border-green-500'
                    : voteCooldown
                    ? 'bg-gray-900 border border-gray-800 opacity-30 cursor-not-allowed'
                    : 'bg-gray-800 border border-gray-700 hover:border-purple-500'}
                `}
              >
                <span className="text-2xl block mb-1">{genre.emoji}</span>
                <span className={`font-bold block text-sm ${isSelected ? 'text-green-300' : 'text-white'}`}>
                  {genre.label}{isSelected ? ' ✓' : ''}
                </span>
                <span className="text-xs text-gray-500 block mt-1">{genre.hint}</span>
              </button>
            )
          })}
        </div>
        {voteConfirmed && (
          <p className="text-center text-green-400 text-xs">Voted! You can update your vote in 30 min</p>
        )}
      </div>

      {/* ── SECTION 2: SHOUT OUT ── */}
      <div className="w-full max-w-md mb-10">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs uppercase tracking-widest text-gray-500">Shout Out</p>
          <span className="text-xs bg-pink-900 text-pink-300 px-2 py-0.5 rounded-full">Tip required</span>
        </div>

        {shoutSubmitted ? (
          <div className="text-center">
            <div className="bg-green-900 border border-green-700 rounded-xl p-5 mb-4">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-green-300 font-bold text-lg">Shout out sent!</p>
              <p className="text-green-500 text-sm mt-1">Hexx got your message</p>
            </div>
            <a href={INSTAGRAM} target="_blank" className="block w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 rounded-xl text-sm transition-all">
              📸 Follow @escandalolv on Instagram
            </a>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Your name"
              value={shoutName}
              onChange={(e) => setShoutName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 mb-3"
            />
            <textarea
              placeholder="Your shout out message..."
              value={shoutMessage}
              onChange={(e) => setShoutMessage(e.target.value)}
              rows="3"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none mb-3"
            />
<a           
href={CASHAPP}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => setShoutTipped(true)}
  className={`block w-full text-center font-bold py-3 rounded-xl text-sm mb-2 transition-all ${shoutTipped ? 'bg-green-800 border border-green-600 text-green-300' : 'bg-green-700 hover:bg-green-600 text-white'}`}
>
  {shoutTipped ? '✓ Tip sent on CashApp' : '💵 Send tip on CashApp first'}
</a>
            <button
              onClick={handleShoutSubmit}
              disabled={!shoutTipped}
              className={`w-full font-bold py-3 rounded-xl text-sm transition-all ${shoutTipped ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
            >
              Submit Shout Out 📣
            </button>
            {shoutError && <p className="text-red-400 text-xs mt-2">{shoutError}</p>}
          </>
        )}
      </div>

      {/* ── SECTION 3: SONG SUGGESTION ── */}
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs uppercase tracking-widest text-gray-500">Suggest a Song</p>
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">Future sets</span>
        </div>
        <p className="text-gray-500 text-xs mb-4">Hexx will review these after the set — no guarantees tonight but your suggestion counts!</p>

        {suggestSubmitted ? (
          <div className="text-center">
            <div className="bg-green-900 border border-green-700 rounded-xl p-5 mb-4">
              <p className="text-3xl mb-2">🎵</p>
              <p className="text-green-300 font-bold text-lg">Added to the list!</p>
              <p className="text-green-500 text-sm mt-1">Hexx checks it after the set</p>
            </div>
            <a href={INSTAGRAM} target="_blank" className="block w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 rounded-xl text-sm transition-all">
              📸 Follow @escandalolv on Instagram
            </a>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Artist name"
              value={suggestArtist}
              onChange={(e) => setSuggestArtist(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-3"
            />
            <input
              type="text"
              placeholder="Song name"
              value={suggestSong}
              onChange={(e) => setSuggestSong(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-3"
            />
            <input
              type="text"
              placeholder="Your name"
              value={suggestName}
              onChange={(e) => setSuggestName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-3"
            />
            <button
              onClick={handleSuggestSubmit}
              className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-sm transition-all"
            >
              Add to the List 🎵
            </button>
            {suggestError && <p className="text-red-400 text-xs mt-2">{suggestError}</p>}
          </>
        )}
      </div>

    </div>
  )
}

export default GuestPage