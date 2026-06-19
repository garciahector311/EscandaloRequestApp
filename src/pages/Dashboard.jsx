import { useEffect, useState } from "react"
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore"
import { db } from "../firebase.js"

const GENRES = [
  { id: 'cumbia', label: 'Cumbia', emoji: '🥁', color: 'bg-purple-600' },
  { id: 'regional', label: 'Regional', emoji: '🤠', color: 'bg-yellow-600' },
  { id: 'merengue', label: 'Merengue', emoji: '🎺', color: 'bg-pink-600' },
  { id: 'reggaeton', label: 'Reggaeton', emoji: '🔥', color: 'bg-red-600' },
  { id: 'english', label: 'English', emoji: '🎤', color: 'bg-blue-600' },
]

function getHourLabel(date) {
  const h = date.getHours()
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}–${(h12 % 12) + 1} ${suffix}`
}

function DashboardPage() {
  const [votes, setVotes] = useState([])
  const [shoutouts, setShoutouts] = useState([])
  const [suggestions, setSuggestions] = useState([])

  // Listen to votes
  useEffect(() => {
    const q = query(collection(db, "votes"), orderBy("createdAt", "desc"))
    return onSnapshot(q, (snapshot) => {
      setVotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  // Listen to shoutouts
  useEffect(() => {
    const q = query(collection(db, "shoutouts"), orderBy("createdAt", "desc"))
    return onSnapshot(q, (snapshot) => {
      setShoutouts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  // Listen to suggestions
  useEffect(() => {
    const q = query(collection(db, "suggestions"), orderBy("createdAt", "desc"))
    return onSnapshot(q, (snapshot) => {
      setSuggestions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  async function handleDelete(collectionName, id) {
    await deleteDoc(doc(db, collectionName, id))
  }

  async function handleClearAll(collectionName, items) {
    const confirmed = confirm(`Clear all ${collectionName}?`)
    if (!confirmed) return
    await Promise.all(items.map(item => deleteDoc(doc(db, collectionName, item.id))))
  }

  // --- GENRE TALLY ---
  const totalVotes = votes.length
  const voteCounts = GENRES.map(g => ({
    ...g,
    count: votes.filter(v => v.genre === g.id).length
  })).sort((a, b) => b.count - a.count)

  // --- VOTES BY HOUR ---
  const votesByHour = {}
  votes.forEach(v => {
    if (!v.createdAt) return
    const date = v.createdAt.toDate()
    const label = getHourLabel(date)
    if (!votesByHour[label]) votesByHour[label] = {}
    votesByHour[label][v.genre] = (votesByHour[label][v.genre] || 0) + 1
  })

  const hourBlocks = Object.entries(votesByHour).map(([hour, genreCounts]) => {
    const topGenreId = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0][0]
    const topGenre = GENRES.find(g => g.id === topGenreId)
    const total = Object.values(genreCounts).reduce((a, b) => a + b, 0)
    return { hour, topGenre, total }
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">

{/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-400">Escandalo! Dashboard</h1>
        <span className="text-xs text-gray-500">{totalVotes} votes tonight</span>
      </div>

      {/* ── SECTION 1: GENRE TALLY ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-gray-500">Genre Votes</p>
          {votes.length > 0 && (
            <button onClick={() => handleClearAll('votes', votes)} className="text-xs text-red-500 hover:text-red-400 bg-gray-800 px-2 py-1 rounded-lg">
              Reset votes
            </button>
          )}
        </div>
        <div className="bg-gray-900 rounded-xl p-4 mb-4">
          {voteCounts.map(g => (
            <div key={g.id} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-lg w-6">{g.emoji}</span>
              <span className="text-sm text-gray-300 w-20 shrink-0">{g.label}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div
                  className={`${g.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: totalVotes > 0 ? `${(g.count / totalVotes) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-sm text-gray-400 w-6 text-right">{g.count}</span>
            </div>
          ))}
          {totalVotes === 0 && (
            <p className="text-gray-600 text-sm text-center py-2">No votes yet</p>
          )}
        </div>

        {/* VOTES BY HOUR */}
        {hourBlocks.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Votes by Hour</p>
            <div className="grid grid-cols-2 gap-2">
              {hourBlocks.map(({ hour, topGenre, total }) => (
                <div key={hour} className="bg-gray-900 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{hour}</p>
                  <p className="text-sm font-bold text-white">{topGenre?.emoji} {topGenre?.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{total} votes</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── SECTION 2: SHOUT OUTS ── */}
      <div className="mb-8">
<div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Shout Outs <span className="text-gray-600 normal-case tracking-normal">({shoutouts.length})</span>
          </p>
          {shoutouts.length > 0 && (
            <button onClick={() => handleClearAll('shoutouts', shoutouts)} className="text-xs text-red-500 hover:text-red-400 bg-gray-800 px-2 py-1 rounded-lg">
              Clear all
            </button>
          )}
        </div>
        {shoutouts.length === 0 ? (
          <p className="text-gray-600 text-sm">No shout outs yet</p>
        ) : (
          <div className="grid gap-3">
            {shoutouts.map(s => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="font-bold text-pink-400 mb-1">{s.name}</p>
                  <p className="text-gray-300 text-sm">"{s.message}"</p>
                  <p className="text-xs text-gray-600 mt-2">
                    {s.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete('shoutouts', s.id)}
                  className="text-red-500 hover:text-red-400 text-xs bg-gray-800 px-2 py-1 rounded-lg shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 3: SONG SUGGESTIONS ── */}
      <div className="mb-8">
<div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Song Suggestions <span className="text-gray-600 normal-case tracking-normal">({suggestions.length})</span>
          </p>
          {suggestions.length > 0 && (
            <button onClick={() => handleClearAll('suggestions', suggestions)} className="text-xs text-red-500 hover:text-red-400 bg-gray-800 px-2 py-1 rounded-lg">
              Clear all
            </button>
          )}
        </div>
        {suggestions.length === 0 ? (
          <p className="text-gray-600 text-sm">No suggestions yet</p>
        ) : (
          <div className="grid gap-3">
            {suggestions.map(s => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="font-bold text-blue-400 mb-0.5">{s.song}</p>
                  <p className="text-gray-400 text-sm">{s.artist}</p>
                  <p className="text-xs text-gray-600 mt-1">from {s.name}</p>
                  <p className="text-xs text-gray-600">
                    {s.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete('suggestions', s.id)}
                  className="text-red-500 hover:text-red-400 text-xs bg-gray-800 px-2 py-1 rounded-lg shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default DashboardPage