import { useState } from 'react'
import Layout             from '../../components/Layout'
import ConversationList   from '../../components/ConversationList'
import ChatWindow         from '../../components/ChatWindow'

const s = {
  grid:   { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem', alignItems: 'start' },
  empty:  { background: '#fff', border: '1px solid #eee', borderRadius: '12px', height: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#bbb' },
  emIcon: { fontSize: '40px', marginBottom: '12px' },
  emText: { fontSize: '14px' },
}

export default function Messages() {
  const [selected, setSelected] = useState(null)

  return (
    <Layout>
      <div style={s.grid}>
        <ConversationList
          selectedId={selected?._id}
          onSelect={setSelected}
        />
        {selected
          ? <ChatWindow conversation={selected} key={selected._id}/>
          : <div style={s.empty}>
              <div style={s.emIcon}>💬</div>
              <div style={s.emText}>Select a conversation to start chatting</div>
            </div>
        }
      </div>
    </Layout>
  )
}