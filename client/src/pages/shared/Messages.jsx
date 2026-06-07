import { useState } from 'react'
import Layout           from '../../components/Layout'
import ConversationList from '../../components/ConversationList'
import ChatWindow       from '../../components/ChatWindow'

const s = {
  outer: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - var(--layout-header-height, 64px))',
    padding: '1rem',
    boxSizing: 'border-box',
    gap: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '1rem',
    flex: 1,
    minHeight: 0,       // critical — lets the grid shrink inside a flex parent
    alignItems: 'stretch',
  },
  empty: {
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#bbb',
    height: '100%',
  },
  emIcon: { fontSize: 36, marginBottom: 10 },
  emText: { fontSize: 14 },
}

export default function Messages() {
  const [selected, setSelected] = useState(null)

  return (
    <Layout>
      <div style={s.outer}>
        <div style={s.grid}>
          <ConversationList
            selectedId={selected?._id}
            onSelect={setSelected}
          />
          {selected
            ? <ChatWindow conversation={selected} key={selected._id} />
            : (
              <div style={s.empty}>
                <div style={s.emIcon}>💬</div>
                <div style={s.emText}>Select a conversation to start chatting</div>
              </div>
            )
          }
        </div>
      </div>
    </Layout>
  )
}