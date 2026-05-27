'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ManagerPage() {
  const [logged, setLogged] = useState(false)
  const [pw, setPw] = useState('')
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    if (localStorage.getItem('mgr') === '1') setLogged(true)
  }, [])

  useEffect(() => {
    if (!logged) return
    async function load() {
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const { data: rows } = await supabase
       .from('reports')
       .select('staff_id, dry_mop, wet_mop, vacuum_cleaning, trash_disposal, roof_cleaning, staff(name)')
       .gte('date', firstDay)

      const stats: any = {}
      rows?.forEach(r => {
        const name = r.staff?.name || 'Unknown'
        if (!stats[name]) stats[name] = {name, done:0, total:0}
        const done = [r.dry_mop, r.wet_mop, r.vacuum_cleaning, r.trash_disposal, r.roof_cleaning].filter(Boolean).length
        stats[name].done += done
        stats[name].total += 5
      })
      setData(Object.values(stats).map((s:any) => ({...s, pct: Math.round(s.done/s.total*100)})))
    }
    load()
  }, [logged])

  if (!logged) {
    return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',background:'#f8fafc'}}>
      <div style={{background:'white',padding:32,borderRadius:12,boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
        <h2 style={{marginBottom:16,fontWeight:'bold'}}>Manager Login</h2>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Enter password"
          style={{border:'1px solid #ccc',padding:8,width:'100%',marginBottom:12,borderRadius:6}}/>
        <button onClick={()=>{if(pw==='manager2026'){localStorage.setItem('mgr','1');setLogged(true)}}}
          style={{background:'#0d9488',color:'white',padding:'8px 16px',width:'100%',borderRadius:6}}>Login</button>
      </div>
    </div>
  }

  return <div style={{padding:24,background:'#f8fafc',minHeight:'100vh'}}>
    <h1 style={{fontSize:24,fontWeight:'bold',marginBottom:24}}>Staff Performance</h1>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:20}}>
      {data.map(s => (
        <div key={s.name} style={{background:'white',padding:20,borderRadius:12,textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
          <div style={{fontWeight:600,marginBottom:12}}>{s.name}</div>
          <div style={{position:'relative',width:100,height:100,margin:'0 auto'}}>
            <svg width="100" height="100" style={{transform:'rotate(-90deg)'}}>
              <circle cx="50" cy="50" r="44" stroke="#e2e8f0" strokeWidth="10" fill="none"/>
              <circle cx="50" cy="50" r="44" stroke="#0d9488" strokeWidth="10" fill="none"
                strokeDasharray={276} strokeDashoffset={276 - 276*s.pct/100} strokeLinecap="round"/>
            </svg>
            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:'bold'}}>{s.pct}%</div>
          </div>
          <div style={{marginTop:8,fontSize:12,color:'#64748b'}}>{s.done}/{s.total} tasks</div>
        </div>
      ))}
    </div>
  </div>
}
