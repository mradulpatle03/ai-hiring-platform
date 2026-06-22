import { useState } from 'react'
import Layout           from '../../components/Layout'
import ConversationList from '../../components/ConversationList'
import ChatWindow       from '../../components/ChatWindow'

const s = {
  outer: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - var(--layout-header-height, 64px))',
    padding: '28px',
    boxSizing: 'border-box',
    gap: '0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  pageHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    marginBottom: '20px',
    flexShrink: 0,
  },
  pageTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: '700',
    fontSize: '24px',
    letterSpacing: '-0.02em',
    color: '#0B0E14',
  },
  pageLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#5C5F6B',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '0',
    flex: 1,
    minHeight: 0,
    alignItems: 'stretch',
    border: '1px solid rgba(11,14,20,0.10)',
    borderRadius: '4px',
    overflow: 'hidden',
    background: '#fff',
  },
  empty: {
    background: '#fff',
    borderLeft: '1px solid rgba(11,14,20,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8A8D98',
    height: '100%',
    gap: '10px',
  },
  emIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(11,14,20,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  emText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#8A8D98',
  },
}

export default function Messages() {
  const [selected, setSelected] = useState(null)

  return (
    <Layout>
      <div style={s.outer}>
        <div style={s.pageHead}>
          <span style={s.pageTitle}>Messages</span>
          <span style={s.pageLabel}>Inbox</span>
        </div>

        <div style={s.grid}>
          <ConversationList
            selectedId={selected?._id}
            onSelect={setSelected}
          />
          {selected
            ? <ChatWindow conversation={selected} key={selected._id} />
            : (
              <div style={s.empty}>
                <div style={s.emText}>Select a conversation!</div>
              </div>
            )
          }
        </div>
      </div>
    </Layout>
  )
}