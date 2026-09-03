const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const CONTENT_FILE = path.join(__dirname, 'content.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'swiftlink2026';

const defaultContent = {
  company: {
    name: "SwiftLink",
    suffix: "Kenya",
    phone: "+254 712 345 678",
    email: "info@kenyatransport.co.ke",
    address: "Nairobi, Kenya"
  },
  hero: {
    title: "Reliable Transport & Construction Solutions Across Kenya",
    subtitle: "Connecting Mombasa to Garissa, Kisumu to Nairobi. Professional logistics, quality building blocks, and expert exhauster services."
  },
  services: [
    {
      title: "Transport Services",
      description: "Full truckload and parcel delivery across all major Kenyan towns. Fast, secure, and affordable logistics solutions.",
      features: ["Same-day dispatch", "Goods insurance", "Real-time tracking", "22+ destinations"]
    },
    {
      title: "Building & Construction Blocks",
      description: "High-quality concrete blocks delivered directly to your construction site. Durable, uniform, and certified.",
      features: ["Machine-pressed blocks", "Bulk orders accepted", "Site delivery included", "Western Kenya coverage"]
    },
    {
      title: "Exhauster Services",
      description: "Professional septic tank emptying and drainage cleaning. Available in Kisii, Nyamira, and Migori counties.",
      features: ["Modern exhauster trucks", "Emergency response", "Licensed disposal", "3-county coverage"]
    }
  ],
  coverage: {
    transportNote: "We operate across Kenya, ensuring your goods and services reach every corner",
    blocksNote: "Free delivery for orders above 1000 blocks. Contact us for pricing.",
    exhausterNote: "Emergency exhauster services available 24/7. Response time under 2 hours."
  },
  footer: {
    tagline: "Your trusted partner for transport, construction materials, and sanitation services across Kenya."
  }
};

function loadContent() {
  if (fs.existsSync(CONTENT_FILE)) {
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
  }
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(defaultContent, null, 2));
  return defaultContent;
}

function saveContent(data) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mailhog',
  port: process.env.SMTP_PORT || 1025
});

// API: Get content
app.get('/api/content', (req, res) => {
  res.json(loadContent());
});

// API: Verify password (new endpoint)
app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Wrong password' });
  }
});

// API: Update content
app.post('/api/content', (req, res) => {
  const { password, content } = req.body;
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }
  if (!content) {
    return res.status(400).json({ error: 'No content provided' });
  }
  
  saveContent(content);
  res.json({ success: true, message: 'Saved! Refresh your website to see changes.' });
});

// Contact form
app.post('/api/contact', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), async (req, res) => {
  try {
    const { name, email, phone, service, location, message, contactMethod } = req.body;
    const content = loadContent();

    if (!name || !email || !message || !service) {
      return res.status(400).json({ error: 'Name, email, service, and message are required' });
    }

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.COMPANY_EMAIL || content.company.email,
      subject: `New ${service} Inquiry from ${name}`,
      html: `
        <h2>New Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Location:</strong> ${location || 'N/A'}</p>
        <p><strong>Contact Method:</strong> ${contactMethod || 'Email'}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });

    res.json({ success: true, message: 'Thank you! We will contact you shortly.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send. Please try again.' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// ============ ADMIN PAGE ============
app.get('/admin', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SwiftLink Admin</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#f0f2f5;color:#333;line-height:1.6}
.container{max-width:800px;margin:0 auto;padding:20px}
.header{background:linear-gradient(135deg,#1d3557,#2a4d7a);color:#fff;padding:25px;border-radius:12px;margin-bottom:25px;text-align:center}
.header h1{font-size:1.6rem}
.header p{opacity:.8;font-size:.9rem;margin-top:5px}

/* Login screen */
.login-box{background:#fff;border-radius:12px;padding:40px;max-width:400px;margin:60px auto;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.1)}
.login-box h2{color:#1d3557;margin-bottom:10px}
.login-box p{color:#666;font-size:.9rem;margin-bottom:25px}
.login-box input{width:100%;padding:14px;border:2px solid #e0e0e0;border-radius:10px;font-size:1rem;margin-bottom:15px;text-align:center}
.login-box input:focus{outline:none;border-color:#e63946}
.login-box button{width:100%;padding:14px;background:#e63946;color:#fff;border:none;border-radius:10px;font-weight:600;font-size:1rem;cursor:pointer;transition:all .3s}
.login-box button:hover{background:#c1121f}
.login-box .error{color:#e63946;font-size:.85rem;margin-top:10px;display:none}

/* Editor */
.card{background:#fff;border-radius:12px;padding:22px;margin-bottom:18px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.card h2{font-size:1.1rem;color:#1d3557;margin-bottom:15px;padding-bottom:8px;border-bottom:2px solid #e63946}
.field{margin-bottom:14px}
.field label{display:block;font-weight:600;margin-bottom:5px;color:#555;font-size:.85rem}
.field input,.field textarea{width:100%;padding:11px 13px;border:2px solid #e0e0e0;border-radius:8px;font-family:inherit;font-size:.9rem}
.field input:focus,.field textarea:focus{outline:none;border-color:#e63946}
.field textarea{resize:vertical;min-height:60px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.btn{background:#e63946;color:#fff;border:none;padding:13px 28px;border-radius:50px;font-weight:600;font-size:1rem;cursor:pointer;transition:all .3s;width:100%}
.btn:hover{background:#c1121f;transform:translateY(-2px)}
.status{margin-top:12px;padding:12px;border-radius:8px;display:none;font-weight:500;font-size:.9rem}
.status.ok{display:block;background:#d4edda;color:#155724;border:1px solid #c3e6cb}
.status.bad{display:block;background:#f8d7da;color:#721c24;border:1px solid #f5c6cb}
.logout{text-align:right;margin-bottom:15px}
.logout button{background:#6c757d;color:#fff;border:none;padding:8px 20px;border-radius:50px;cursor:pointer;font-size:.85rem}
.logout button:hover{background:#5a6268}
.help{font-size:.8rem;color:#666;margin-top:15px;padding:12px;background:#f8f9fa;border-radius:8px}
@media(max-width:600px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🛠️ SwiftLink Website Editor</h1>
    <p>Edit your website without touching code</p>
  </div>

  <!-- LOGIN SCREEN -->
  <div id="loginScreen" class="login-box">
    <h2>🔐 Admin Login</h2>
    <p>Enter your password to access the editor</p>
    <input type="password" id="pass" placeholder="Password" onkeypress="if(event.key==='Enter')login()">
    <button onclick="login()">Unlock Editor</button>
    <div id="loginError" class="error">Wrong password. Try again.</div>
  </div>

  <!-- EDITOR (Hidden until login) -->
  <div id="editor" style="display:none">
    <div class="logout">
      <button onclick="logout()">🔒 Lock / Logout</button>
    </div>

    <div class="card">
      <h2>🏢 Company Info</h2>
      <div class="grid">
        <div class="field"><label>Company Name</label><input type="text" id="cName"></div>
        <div class="field"><label>Suffix (e.g. Kenya)</label><input type="text" id="cSuffix"></div>
        <div class="field"><label>Phone</label><input type="text" id="cPhone"></div>
        <div class="field"><label>Email</label><input type="text" id="cEmail"></div>
      </div>
      <div class="field"><label>Address</label><input type="text" id="cAddress"></div>
    </div>

    <div class="card">
      <h2>🎯 Hero Section</h2>
      <div class="field"><label>Headline</label><input type="text" id="hTitle"></div>
      <div class="field"><label>Subtitle</label><textarea id="hSub"></textarea></div>
    </div>

    <div class="card">
      <h2>🚛 Transport Service</h2>
      <div class="field"><label>Title</label><input type="text" id="s1Title"></div>
      <div class="field"><label>Description</label><textarea id="s1Desc"></textarea></div>
    </div>

    <div class="card">
      <h2>🧱 Building Blocks Service</h2>
      <div class="field"><label>Title</label><input type="text" id="s2Title"></div>
      <div class="field"><label>Description</label><textarea id="s2Desc"></textarea></div>
    </div>

    <div class="card">
      <h2>🚰 Exhauster Service</h2>
      <div class="field"><label>Title</label><input type="text" id="s3Title"></div>
      <div class="field"><label>Description</label><textarea id="s3Desc"></textarea></div>
    </div>

    <div class="card">
      <h2>📝 Coverage Notes</h2>
      <div class="field"><label>Transport Note</label><textarea id="nTransport"></textarea></div>
      <div class="field"><label>Blocks Note</label><textarea id="nBlocks"></textarea></div>
      <div class="field"><label>Exhauster Note</label><textarea id="nExhauster"></textarea></div>
    </div>

    <div class="card">
      <h2>📋 Footer</h2>
      <div class="field"><label>Tagline</label><textarea id="fTagline"></textarea></div>
    </div>

    <button class="btn" onclick="save()">💾 Save All Changes</button>
    <div id="status" class="status"></div>
  </div>

  <div class="help">
    <strong>How to use:</strong> Login with password → edit text → click Save → refresh your website to see changes.
    <br><br>
    <strong>Default password:</strong> <code>swiftlink2026</code> — Change it in your <code>.env</code> file: <code>ADMIN_PASSWORD=yourpass</code>
  </div>
</div>

<script>
let data = {};
let isLoggedIn = false;

async function login() {
  const pass = document.getElementById('pass').value;
  const errorDiv = document.getElementById('loginError');
  
  if (!pass) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Please enter a password';
    return;
  }
  
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    });
    
    if (res.ok) {
      isLoggedIn = true;
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('editor').style.display = 'block';
      errorDiv.style.display = 'none';
      load();
    } else {
      errorDiv.style.display = 'block';
      errorDiv.textContent = 'Wrong password. Try again.';
    }
  } catch (e) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Server error. Is Docker running?';
  }
}

function logout() {
  isLoggedIn = false;
  document.getElementById('pass').value = '';
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('editor').style.display = 'none';
  document.getElementById('loginError').style.display = 'none';
}

async function load() {
  const r = await fetch('/api/content');
  data = await r.json();
  
  document.getElementById('cName').value = data.company.name;
  document.getElementById('cSuffix').value = data.company.suffix;
  document.getElementById('cPhone').value = data.company.phone;
  document.getElementById('cEmail').value = data.company.email;
  document.getElementById('cAddress').value = data.company.address;
  
  document.getElementById('hTitle').value = data.hero.title;
  document.getElementById('hSub').value = data.hero.subtitle;
  
  document.getElementById('s1Title').value = data.services[0].title;
  document.getElementById('s1Desc').value = data.services[0].description;
  document.getElementById('s2Title').value = data.services[1].title;
  document.getElementById('s2Desc').value = data.services[1].description;
  document.getElementById('s3Title').value = data.services[2].title;
  document.getElementById('s3Desc').value = data.services[2].description;
  
  document.getElementById('nTransport').value = data.coverage.transportNote;
  document.getElementById('nBlocks').value = data.coverage.blocksNote;
  document.getElementById('nExhauster').value = data.coverage.exhausterNote;
  
  document.getElementById('fTagline').value = data.footer.tagline;
}

function show(msg, ok) {
  const s = document.getElementById('status');
  s.textContent = msg;
  s.className = 'status ' + (ok ? 'ok' : 'bad');
}

async function save() {
  if (!isLoggedIn) return show('Please login first', false);
  
  const pass = document.getElementById('pass').value;
  
  const updated = {
    company: {
      name: document.getElementById('cName').value,
      suffix: document.getElementById('cSuffix').value,
      phone: document.getElementById('cPhone').value,
      email: document.getElementById('cEmail').value,
      address: document.getElementById('cAddress').value
    },
    hero: {
      title: document.getElementById('hTitle').value,
      subtitle: document.getElementById('hSub').value
    },
    services: [
      { ...data.services[0], title: document.getElementById('s1Title').value, description: document.getElementById('s1Desc').value },
      { ...data.services[1], title: document.getElementById('s2Title').value, description: document.getElementById('s2Desc').value },
      { ...data.services[2], title: document.getElementById('s3Title').value, description: document.getElementById('s3Desc').value }
    ],
    coverage: {
      transportNote: document.getElementById('nTransport').value,
      blocksNote: document.getElementById('nBlocks').value,
      exhausterNote: document.getElementById('nExhauster').value
    },
    footer: {
      tagline: document.getElementById('fTagline').value
    }
  };
  
  try {
    const r = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass, content: updated })
    });
    const result = await r.json();
    if (r.ok) { show('✅ Saved! Refresh your website to see changes.', true); data = updated; }
    else { show('❌ ' + result.error, false); }
  } catch (e) { show('❌ Failed to save', false); }
}
</script>
</body>
</html>`);
});

app.listen(PORT, '0.0.0.0', () => console.log('Backend + Admin running on port ' + PORT));
