import { createContext, useContext, useState, useCallback, useEffect } from 'react'

import { getReports, saveReports, getArticles, saveArticles, saveProfileSettings } from '../data/store.js'
import { CATEGORIES } from '../data/categories.js'

export const AuthContext = createContext(null)

const RANKS = [
  { name: 'Skiller', xp: 0 },
  { name: 'Expert', xp: 1000 },
  { name: 'Elite', xp: 3000 },
  { name: 'Legend', xp: 8000 },
]

// ── Auth key generator (HP-XXXX-XXXX) ──
export function genAuthKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `HP-${part()}-${part()}`
}

// ── Users ──
export function getUsers() {
  return JSON.parse(localStorage.getItem('hackpark_users') || '[]')
}

export function saveUsers(users) {
  localStorage.setItem('hackpark_users', JSON.stringify(users))
}

// ── Admin user seeding ──
export const ADMIN_USER_KEY = 'HP-ADMIN-0001'

function seedAdminUser() {
  const users = getUsers()
  if (users.find(u => u.authKey === ADMIN_USER_KEY)) return
  users.push({
    name: 'Администратор',
    email: 'admin@hackpark.ru',
    telegram: 'hackpark_admin',
    status: 'approved',
    authKey: ADMIN_USER_KEY,
    role: 'admin',
    reward: 0,
    bonusPoints: 0,
    loginAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString()
  })
  saveUsers(users)
}


// ── Seed demo researchers, reports, articles (runs once, guarded by flag) ──
const SEED_FLAG = 'hackpark_demo_seeded_v1'

function makeAvatar(initial, c1, c2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="256" height="256" rx="128" fill="url(#g)"/><text x="128" y="128" font-family="Arial,sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initial}</text></svg>`
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

function makeBanner(c1, c2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" viewBox="0 0 800 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${c1}"/><stop offset="50%" stop-color="${c2}"/><stop offset="100%" stop-color="${c1}"/></linearGradient></defs><rect width="800" height="200" fill="url(#g)"/><circle cx="100" cy="100" r="60" fill="white" opacity="0.05"/><circle cx="700" cy="50" r="80" fill="white" opacity="0.05"/><circle cx="400" cy="180" r="40" fill="white" opacity="0.03"/></svg>`
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

function seedDemoData() {
  if (localStorage.getItem(SEED_FLAG)) return

  const researchers = [
    { name:'Mikhail Volkov', email:'m.volkov@protonmail.com', telegram:'ne0n_h4wk', bio:'Web pentester, OWASP enthusiast. Hunting XSS and IDOR.' },
    { name:'Anna Sokolova', email:'a.sokolova@tutamail.com', telegram:'ph4nt0m_cat', bio:'Crypto analyst, CTF player. Breaking ciphers since 2019.' },
    { name:'Dmitriy Orlov', email:'d.orlov@duck.com', telegram:'0xNRG', bio:'Pwn lover, CTF addict. I live in GDB.' },
    { name:'Ekaterina Lebedeva', email:'k.lebedeva@pm.me', telegram:'k1tt3n_0f_d00m', bio:'Mobile security researcher, Frida ninja.' },
    { name:'Sergey Morozov', email:'s.morozov@hackmail.ru', telegram:'fr0st_b1te', bio:'Network & infra pentester. CCNA, OSCP.' },
    { name:'Olga Kuznetsova', email:'o.kuznetsova@cryptolab.net', telegram:'n3xus_red', bio:'Digital forensic analyst, APT hunter.' },
    { name:'Pavel Novikov', email:'p.novikov@proton.me', telegram:'sh4d3_st0rm', bio:'Red team operator, social engineering specialist.' },
    { name:'Maria Zaitseva', email:'m.zaitseva@secbox.io', telegram:'0xV01D', bio:'DevSecOps engineer, automating security pipelines.' },
    { name:'Artem Smirnov', email:'a.smirnov@h4cker.net', telegram:'v1p3r_sl4yer', bio:'IoT & hardware hacker, soldering and reversing firmware.' },
    { name:'Viktoriya Ivanova', email:'v.ivanova@cybertech.io', telegram:'bl4d3_r3aper', bio:'AppSec engineer, shipping SAST/DAST pipelines.' },
    { name:'Roman Petrov', email:'r.petrov@darkmail.net', telegram:'gh0st_c0der', bio:'Malware analyst, studying rootkits and bootkits.' },
    { name:'Daria Vasileva', email:'d.vasileva@secureinbox.ru', telegram:'ph1l0s0ph3r', bio:'Threat intelligence analyst, tracking APT groups.' },
    { name:'Igor Sokolov', email:'i.sokolov@pentestlab.ru', telegram:'w01f_b3rserk', bio:'Pentester, OSCP+OSEP, ten years in red team.' },
    { name:'Natalya Makarova', email:'n.makarova@cybersec.pm', telegram:'f1r3fly_0x', bio:'Crypto engineer. Designing ACME protocols and TLS.' },
    { name:'Alexey Popov', email:'a.popov@bughunter.ru', telegram:'r00tk1t_w1z4rd', bio:'IoT & mobile hacker, cracking BLE protocols.' },
  ]

  const avColors = [
    ['#ff3b30','#ff9500'],['#34c759','#00c7be'],['#0a84ff','#5e5ce6'],['#bf5af2','#ff375f'],
    ['#ff9500','#ffcc00'],['#00c7be','#0a84ff'],['#5e5ce6','#bf5af2'],['#ff375f','#ff3b30'],
    ['#34c759','#0a84ff'],['#ffcc00','#ff375f'],['#bf5af2','#0a84ff'],['#ff3b30','#bf5af2'],
    ['#00c7be','#34c759'],['#5e5ce6','#ff9500'],['#ff375f','#34c759'],
  ]
  const bnColors = [
    ['#1a1a2e','#16213e'],['#0f0c29','#302b63'],['#1a1a2e','#e94560'],['#0a0a23','#3d3d6e'],
    ['#1a0a2e','#4a0a4e'],['#0e2a25','#1a5f4a'],['#2a1a0e','#5f3a1a'],['#0e1a2a','#1a3a5f'],
    ['#2e1a1a','#5f1a3a'],['#1a2e1a','#3a5f1a'],['#2a0a2a','#5f1a5f'],['#0a2a2a','#1a5f5f'],
    ['#2a2a0e','#3a3a1a'],['#2a2a0e','#5f5f1a'],['#0e0a2a','#1a1a5f'],
  ]

  const targets = [
    {target:'HackPark',slug:'hackpark'},{target:'TechStore',slug:'techstore'},
    {target:'CloudVault',slug:'cloudvault'},{target:'PaymentsAPI',slug:'paymentsapi'},
    {target:'MediPortal',slug:'mediportal'},{target:'SocialNet',slug:'socialnet'},
    {target:'CryptoExchange',slug:'cryptoexchange'},{target:'IoTHub',slug:'iothub'},
    {target:'BookingPlatform',slug:'bookingplatform'},{target:'FileShare',slug:'fileshare'},
  ]
  const sevs = ['Critical','High','Medium','Low']
  const sevReward = {Critical:15000,High:8000,Medium:3000,Low:1000}
  const sevXP = {Critical:500,High:300,Medium:150,Low:50}
  const reportTitles = [
    'XSS in search via SVG injection','SQL Injection in auth API','SSRF via webhook endpoint',
    'IDOR: access to other orders via order_id','CSRF on email change without token',
    'Stored XSS in profile (bio field)','Blind SSRF via import function','RCE via deserialization in API',
    'Race condition on withdrawal','JWT with none algorithm accepts empty signature',
    'Path Traversal in file upload','Open Redirect via returnUrl parameter','XXE via SVG avatar parsing',
    'Insecure Deserialization in cache layer','Broken Access Control: admin panel without auth',
    'DOM-based XSS in SPA router','CORS misconfiguration with credentials: true',
    'SQLi in catalog filter (ORDER BY)','Info Disclosure via .git/ directory',
    'No rate-limit on login endpoint','GraphQL introspection enabled in production',
    'HTTP request smuggling via CL.TE','Mass assignment: admin role via PUT /api/profile',
    'Weak crypto: MD5 for password hashing','IDOR in API /users/{id}','Reflected XSS via Referer header',
    'NoSQL Injection in MongoDB query','JWT secret key = secret','Buffer overflow in C extension handler',
    'SSRF in link preview feature',
  ]
  const articleTemplates = [
    {title:'How I found blind SSRF via link parsing',cat:'web',body:'Recently I stumbled upon an interesting SSRF while testing a link preview feature. The platform allowed inserting arbitrary URLs and parsed Open Graph metadata. I sent a request with the URL http://169.254.169.254/latest/meta-data/ and got back a response containing IAM credentials. From there it was a matter of technique: using DNS-rebinding I was able to bypass the whitelist-based protection. In this article I will break down: 1) How link preview works under the hood 2) SSRF vectors through Open Graph parsers 3) DNS-rebinding against whitelists 4) How to prevent it: egress filters, not blacklists'},
    {title:'OSINT: finding target developers via LinkedIn',cat:'recon',body:'Remember: every job posting is a technology map. For example, looking for React Redux Spring Boot GraphQL AWS S3 SQS Docker Vercel is already a stack profile. Add GitHub search: users filtered by repositories with test keys, repositories 2+ years old. Admin accounts: email enumeration through BreachCompilation, public dark web dumps, intelx.io. A surprisingly large number of developers use corporate email for personal accounts.'},
    {title:'Reverse Engineering: unpacking UPX manually',cat:'reverse',body:'Once in the wild I came across a file packed with vanilla UPX but with a modified header so that upx -d failed. If upx -d payload.bin does not work, you have to unpack by hand. Open in Ghidra, find the section that writes to the original OEP. Instructions: 1) Set a breakpoint on WriteProcessMemory or the equivalent mmap+memcpy 2) Run until the unpacker writes decrypted code 3) Dump the memory region 4) Fix the entry point and rebuild the IAT'},
    {title:'Frida hooks for Android app analysis',cat:'mobile',body:'The target is an internet banking app. Frida is an indispensable tool. Code sketch: Java.perform(function() { var Pwd = Java.use(com.bank.Pwd); Pwd.check.implementation = function(p) { return true } }). This bypasses root detection and SSL pinning alike: simply overwrite the methods. Setup: pip install frida-tools, adb shell, frida-server on the device. Hook: frida -U -f com.target.app -l hook.js'},
    {title:'ROP chains for beginners: exercise 6',cat:'pwn',body:'In this guide I will show how a stack overflow attack works. Steps: 1) Find gadgets: ROPgadget.py --binary target --only pop|ret 2) Use pop rdi; ret to pass the address of the /bin/sh string 3) Jump to system@plt via the PLT/GOT table. Exercise: call read@plt to read more payload, then pivot the stack. Check for stack canaries with checksec. If a canary is present you need an info leak first.'},
    {title:'Hiding C2 traffic behind CDN static files',cat:'redteam',body:'During a red team engagement we needed to hide C2 traffic. We used the Havoc framework. The C2 profile was tuned to look like a legitimate CDN proxy. Approach: steganography host behind static assets on a CDN, DNS tunneling for low-bandwidth exfiltration, noisy but EDR-evading beacons using jitter and sleep masking. This kept us undetected for two weeks inside the network.'},
  ]

  // Deterministic PRNG (seed 42)
  let _seed = 42
  function rng() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff }
  function rngInt(max) { return Math.floor(rng() * max) }
  function rngPick(arr) { return arr[Math.floor(rng() * arr.length)] }

  const baseTs = Date.now()
  const dayMs = 86400000
  const minMs = 60000

  // ── Users + profiles ──
  const existingUsers = getUsers()
  const newUsers = []
  const profiles = {}
  const reportRewards = []
  const rewardMap = {}
  const xpMap = {}

  for (let i = 0; i < researchers.length; i++) {
    const r = researchers[i]
    const key = 'HP-RND-' + (1000 + i)
    const initial = r.name.charAt(0).toUpperCase()
    const ac = avColors[i % avColors.length]
    const bc = bnColors[i % bnColors.length]
    const submittedDays = 30 + rngInt(150)
    const submittedAt = new Date(baseTs - submittedDays * dayMs).toISOString()
    const approvedAt = new Date(baseTs - (submittedDays - (1 + rngInt(6))) * dayMs).toISOString()
    const loginMin = 2 + rngInt(60 * 24 * 7)
    const loginAt = new Date(baseTs - loginMin * minMs).toISOString()

    newUsers.push({
      name: r.name, email: r.email, telegram: r.telegram, status: 'approved',
      authKey: key, reward: rngPick([0, 5000, 10000, 20000]),
      bonusPoints: rngPick([0, 200, 500, 1000]),
      submittedAt, approvedAt, loginAt,
    })

    profiles[key] = {
      displayName: r.telegram, email: r.email, telegram: r.telegram, bio: r.bio,
      avatar: makeAvatar(initial, ac[0], ac[1]), banner: makeBanner(bc[0], bc[1]),
    }
    saveProfileSettings(profiles[key], key)

    // 2-6 reports per user
    const numR = 2 + rngInt(5)
    for (let j = 0; j < numR; j++) {
      const tgt = rngPick(targets)
      const sev = rngPick(sevs)
      const title = rngPick(reportTitles)
      const rid = 'R-' + (1000 + rngInt(8999)) + '-' + (10 + rngInt(89))
      const roll = rng()
      const status = roll < 0.6 ? 'confirmed' : (roll < 0.85 ? 'triage' : 'rejected')
      const rpt = {
        id: rid, reportId: rid, target: tgt.target, slug: tgt.slug,
        title, severity: sev, cvss: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
        desc: 'Found a ' + sev + ' severity vulnerability in ' + tgt.target + '. Steps to reproduce and impact described below.',
        steps: ['Open the target page','Manipulate the parameter','Observe the result'],
        filesCount: rngInt(4),
        reporter: r.name, reporterName: r.telegram, reporterKey: key,
        status,
        submittedAt: new Date(baseTs - (1 + rngInt(submittedDays)) * dayMs).toISOString(),
      }
      if (status === 'confirmed') {
        rpt.resolvedAt = new Date(baseTs - rngInt(30) * dayMs).toISOString()
        rpt.reward = sevReward[sev]
        rewardMap[rid] = sevReward[sev]
        xpMap[rid] = sevXP[sev]
      }
      reportRewards.push(rpt)
    }
  }

  // Save users (merge with existing, avoid dup keys)
  const existingKeys = new Set(existingUsers.map(u => u.authKey))
  const merged = [...existingUsers]
  for (const u of newUsers) {
    if (!existingKeys.has(u.authKey)) merged.push(u)
  }
  saveUsers(merged)

  // Save reports (merge with existing)
  const existingReports = getReports()
  saveReports([...reportRewards, ...existingReports])

  // Save reward/xp maps
  localStorage.setItem('hackpark_reward_map', JSON.stringify(rewardMap))
  localStorage.setItem('hackpark_xp_map', JSON.stringify(xpMap))

  // ── Articles ──
  const newArticles = []
  for (let i = 0; i < articleTemplates.length; i++) {
    const tmpl = articleTemplates[i]
    const idx = i % researchers.length
    const authorKey = 'HP-RND-' + (1000 + idx)
    const numLikes = rngInt(9)
    const likes = []
    for (let l = 0; l < numLikes; l++) likes.push('HP-RND-' + (1000 + rngInt(15)))
    const comments = []
    if (rng() > 0.4) {
      const cidx = rngInt(15)
      comments.push({
        id: 'c-' + i + '-' + (1000 + rngInt(8999)),
        author: researchers[cidx].telegram,
        authorKey: 'HP-RND-' + (1000 + cidx),
        text: rngPick(['Great article!','Thanks for the guide, very useful.','I had a similar experience.','Interesting approach!','Bookmarked.','Confirmed, method works.']),
        createdAt: new Date(baseTs - (1 + rngInt(30)) * dayMs).toISOString(),
      })
    }
    newArticles.push({
      id: 'art-seed-' + i + '-' + (1000 + rngInt(8999)),
      title: tmpl.title, body: tmpl.body, category: tmpl.cat,
      author: researchers[idx].telegram, authorKey,
      createdAt: new Date(baseTs - (1 + rngInt(40)) * dayMs).toISOString(),
      likes, comments,
    })
  }
  const existingArticles = getArticles()
  saveArticles([...newArticles, ...existingArticles])

  localStorage.setItem(SEED_FLAG, '1')
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      // Read from cookie (persistent session)
      const m = document.cookie.match(/(?:^|; )hackpark_auth=([^;]+)/)
      if (m) {
        const session = JSON.parse(decodeURIComponent(m[1]))
        // Update loginAt to now so user appears online on page reload
        const users = getUsers()
        const found = users.find(u => u.authKey === session.authKey)
        if (found) {
          found.loginAt = new Date().toISOString()
          saveUsers(users)
          session.loginAt = found.loginAt
        }
        setUser(session)
      }
    } catch {}
    // Seed admin user on first load
    seedAdminUser()
    seedDemoData()
    setLoading(false)
  }, [])

  const login = useCallback((authKey) => {
    const users = getUsers()
    const found = users.find(u => u.authKey === authKey)
    if (!found) return { ok: false, error: 'Неверный код участника. Проверьте ключ или обратитесь к администратору.' }
    if (found.status === 'pending') return { ok: false, error: 'Ваша заявка ещё на рассмотрении администратора. Мы сообщим, когда аккаунт будет активирован.' }
    if (found.status === 'banned') return { ok: false, error: 'Ваш аккаунт заблокирован. Свяжитесь с администратором HackPark в Telegram.' }

    // Update last login time on the stored user record for online detection
    found.loginAt = new Date().toISOString()
    saveUsers(users)

    const session = {
      user: found.name,
      email: found.email,
      authKey: found.authKey,
      role: found.role || 'user',
      joined: found.submittedAt,
      loginAt: found.loginAt
    }
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `hackpark_auth=${encodeURIComponent(JSON.stringify(session))}; expires=${expires}; path=/; SameSite=Lax`
    setUser(session)

    // Sync admin-awarded rewards to dash data
    const dashData = JSON.parse(localStorage.getItem('hackpark_dash_data') || '{}')
    if (found.reward > 0) dashData.bonusEarnings = found.reward
    if (found.bonusPoints > 0) dashData.bonusPoints = found.bonusPoints
    localStorage.setItem('hackpark_dash_data', JSON.stringify(dashData))

    return { ok: true }
  }, [])

  const register = useCallback((data) => {
    const users = getUsers()
    // Check dup email
    if (users.find(u => u.email === data.email)) {
      return { ok: false, error: 'Пользователь с таким email уже зарегистрирован.' }
    }
    const authKey = genAuthKey()
    const newUser = {
      ...data,
      status: 'pending',
      authKey,
      reward: 0,
      bonusPoints: 0,
      submittedAt: new Date().toISOString()
    }
    users.push(newUser)
    saveUsers(users)
    localStorage.setItem('hackpark_pending_registration', JSON.stringify(newUser))
    return { ok: true, authKey }
  }, [])

  const logout = useCallback(() => {
    document.cookie = 'hackpark_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, RANKS }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
