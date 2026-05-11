import { useState, useEffect, useRef } from 'react'

function Chat({ user, supabase, onLogout, onDeleteAccount }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
      if (!error) setMessages(data)
    }
    fetchMessages()

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => setMessages(prev => [...prev, payload.new])
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' },
        payload => setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    const { error: insertError } = await supabase.from('messages').insert([{
      content: newMessage,
      user_id: user.id,
      user_email: user.email,
    }])
    if (insertError) setError(insertError.message)
    else setNewMessage('')
  }

  const deleteMessage = async (id) => {
    const { error: delError } = await supabase.from('messages').delete().eq('id', id)
    if (delError) setError(delError.message)
  }

  const clearMyMessages = async () => {
    if (!window.confirm('Delete all your messages?')) return
    const { error: delError } = await supabase.from('messages').delete().eq('user_id', user.id)
    if (delError) setError(delError.message)
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-avatar">🎓</div>
        <div className="header-info">
          <h3>Student Chat App</h3>
          <div className="status">
            <span className="status-dot" />
            Online
          </div>
        </div>
        <div className="header-menu" ref={menuRef}>
          <button className="menu-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            ⋮
          </button>
          {menuOpen && (
            <div className="menu-dropdown">
              <button onClick={() => { setMenuOpen(false); clearMyMessages(); }}>
                🗑️ Clear my messages
              </button>
              <button onClick={() => { setMenuOpen(false); onLogout(); }}>
                🚪 Logout
              </button>
              <button className="danger-item" onClick={() => { setMenuOpen(false); onDeleteAccount(); }}>
                ⚠️ Delete account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User email pill */}
      <div className="user-pill">{user.email}</div>

      {/* Messages */}
      <div className="messages-list">
        {messages.map((msg) => {
          const isOwn = msg.user_id === user.id;
          return (
            <div key={msg.id} className={`message ${isOwn ? 'own' : 'other'}`}>
              {!isOwn && <div className="message-sender">{msg.user_email}</div>}
              <div className="message-bubble">
                <div className="message-content">{msg.content}</div>
                <div className="message-meta">
                  <span className="message-time">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isOwn && (
                    <button className="delete-msg-btn" onClick={() => deleteMessage(msg.id)} title="Delete">✕</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <button type="submit" aria-label="Send">➤</button>
      </form>

      {error && <div className="error">{error}</div>}
    </div>
  )
}

export default Chat;
