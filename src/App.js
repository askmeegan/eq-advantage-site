import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

// EQAdvantageCourse.com - Single-file React app (Tailwind + shadcn/ui friendly)
// NOTE: This is a frontend-only starting point. Backend endpoints required:
//  - POST /api/subscribe        -> accept { email, name? } and store in your email service (Mailchimp/ConvertKit)
//  - POST /api/create-checkout -> accept { priceId } and return { sessionId } from Stripe
//  - POST /api/login            -> accept { email, password } -> return { token }
//  - POST /api/register         -> accept { email, name, password } -> return { token }
//  - GET  /api/course-status    -> (auth) returns access rights
// Secure your keys/server-side. See notes at bottom.

// Simple Auth context using localStorage token (placeholder for real auth)
const AuthContext = createContext();
function useAuth() {
  return useContext(AuthContext);
}
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const u = localStorage.getItem('eq_user');
    if (u) setUser(JSON.parse(u));
  }, []);
  const login = (userObj) => { localStorage.setItem('eq_user', JSON.stringify(userObj)); setUser(userObj); };
  const logout = () => { localStorage.removeItem('eq_user'); setUser(null); };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
  );
}

// Utility: call backend endpoints - replace origin or use env var when deploying
async function api(path, body) {
  const res = await fetch(path, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  return res.json();
}

// Home / Marketing landing page
function Home() {
  const [freeEmail, setFreeEmail] = useState('');
  const [freeName, setFreeName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);

  async function handleFreebie(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // send to your email service endpoint
      await api('/api/subscribe', { email: freeEmail, name: freeName, tag: 'freebie-eq' });
      setThanks(true);
      setFreeEmail(''); setFreeName('');
    } catch (err) {
      alert('Unable to subscribe — check console for details.');
      console.error(err);
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
        <Link to="/" className="text-2xl font-semibold">EQ Advantage</Link>
        <nav className="space-x-4">
          <Link className="hover:underline" to="/course">Course</Link>
          <Link className="hover:underline" to="/login">Login</Link>
          <Link className="px-4 py-2 bg-black text-white rounded-md" to="/pricing">Enroll</Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <section>
          <h1 className="text-4xl font-extrabold leading-tight">Emotional Intelligence for Busy Professionals</h1>
          <p className="mt-4 text-lg text-gray-700">Learn the leadership skill AI can't replicate. 6 self-paced modules designed to boost your influence, decision-making, and career trajectory — without a long time commitment.</p>

          <ul className="mt-6 space-y-2 text-gray-700">
            <li>• Six short, deep-dive modules (video + worksheets)</li>
            <li>• Lifetime access — learn at your pace</li>
            <li>• Practical frameworks to use at work immediately</li>
            <li>• Upgrade options: 1:1 coaching and advanced courses</li>
          </ul>

          <div className="mt-6 flex gap-3">
            <Link to="/pricing" className="px-5 py-3 rounded-md border border-black">Enroll Now</Link>
            <a href="#freebie" className="px-5 py-3 rounded-md bg-black text-white">Get Free Chapter</a>
          </div>
        </section>

        <aside className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium">Grab the Free Chapter</h3>
          <p className="mt-2 text-sm text-gray-600">Instant download: "EQ at Work" — short chapter + 1 worksheet.</p>
          {!thanks ? (
            <form onSubmit={handleFreebie} id="freebie" className="mt-4 space-y-3">
              <input value={freeName} onChange={e=>setFreeName(e.target.value)} placeholder="Your name (optional)" className="w-full border rounded px-3 py-2" />
              <input value={freeEmail} onChange={e=>setFreeEmail(e.target.value)} placeholder="work email" required type="email" className="w-full border rounded px-3 py-2" />
              <button disabled={submitting} className="w-full py-2 rounded bg-sky-900 text-white">Send me the free chapter</button>
            </form>
          ) : (
            <div className="mt-4 text-green-700">Thanks — check your inbox for the download link.</div>
          )}

          <p className="mt-3 text-xs text-gray-400">We respect your privacy. You can unsubscribe anytime.</p>
        </aside>
      </main>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold">What you'll get</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature title="Practical modules" desc="Short videos, clear frameworks, real workplace scripts." />
          <Feature title="Lifetime access" desc="Return anytime — the course grows with you." />
          <Feature title="Coaching upgrade" desc="Personalized coaching to accelerate results." />
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-sm text-gray-500">© {new Date().getFullYear()} EQ Advantage • Designed for busy professionals</footer>
    </div>
  );
}
function Feature({title, desc}) { return (
  <div className="bg-white p-5 rounded shadow-sm">
    <h4 className="font-semibold">{title}</h4>
    <p className="mt-2 text-sm text-gray-600">{desc}</p>
  </div>
)}

// Pricing / Checkout page
function Pricing() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function handleBuy() {
    setLoading(true);
    try {
      const res = await api('/api/create-checkout', { priceId: 'price_1SLQNIKj3lkaQ2Tyd8XlGsST' });
      // res.sessionId expected
      // Redirect to Stripe checkout on server response; this is placeholder
      if (res.sessionId) {
        window.location.href = res.checkoutUrl || `https://checkout.stripe.com/pay/${res.sessionId}`;
      } else {
        alert('Checkout setup error — see console.');
        console.error(res);
      }
    } catch (err) { console.error(err); alert('Unable to start checkout.'); }
    setLoading(false);
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
        <Link to="/" className="text-2xl font-semibold">EQ Advantage</Link>
        <nav className="space-x-4">
          <Link className="hover:underline" to="/course">Course</Link>
          <Link className="hover:underline" to="/login">Login</Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold">EQ Advantage — Full Course</h2>
          <p className="mt-2 text-gray-700">Lifetime access to 6 modules, downloadable worksheets, community updates, and upgrade options.</p>
          <div className="mt-6 flex items-baseline gap-4">
            <div className="text-4xl font-extrabold">$297</div>
            <div className="text-sm text-gray-500">one-time payment</div>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={handleBuy} disabled={loading} className="px-6 py-3 rounded bg-sky-900 text-white">Buy Now</button>
            <Link to="/login" className="px-6 py-3 border rounded">I already have access</Link>
          </div>

          <div className="mt-6 text-sm text-gray-600">Secure payments powered by Stripe. Your card details are processed by Stripe — keys live on the server.</div>
        </div>
      </main>
    </div>
  );
}

// Simple login/register (front-end) — swap to real auth endpoints in production
function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api('/api/login', { email, password });
      if (res.token) {
        login({ email, token: res.token });
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) { console.error(err); setError('Login error'); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h3 className="text-xl font-semibold">Login</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full border rounded px-3 py-2" />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-sky-900 text-white rounded">Sign in</button>
            <Link to="/register" className="px-4 py-2 border rounded">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
function Register() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  async function handleRegister(e) {
    e.preventDefault();
    try {
      const res = await api('/api/register', { email, name, password });
      if (res.token) { login({ email, token: res.token }); navigate('/dashboard'); }
      else alert(res.message || 'Registration failed');
    } catch (err) { console.error(err); alert('Registration error'); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h3 className="text-xl font-semibold">Create account</h3>
        <form onSubmit={handleRegister} className="mt-4 space-y-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full border rounded px-3 py-2" />
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full border rounded px-3 py-2" />
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-sky-900 text-white rounded">Create account</button>
            <Link to="/login" className="px-4 py-2 border rounded">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// Dashboard & Course Player — gated
function Dashboard() {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="font-semibold">Welcome back, {user.email}</div>
        <div className="flex gap-3 items-center">
          <Link to="/course" className="underline">Go to Course</Link>
          <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold">Your course progress</h3>
          <p className="mt-3 text-sm text-gray-600">Track which modules you've completed. Progress is stored on the server in production.</p>
          <ModuleList />
        </div>
        <aside className="bg-white p-6 rounded shadow">
          <h4 className="font-semibold">Upgrades</h4>
          <p className="mt-2 text-sm text-gray-600">1:1 coaching slots — book a consult to accelerate your results.</p>
          <button className="mt-4 w-full py-2 rounded bg-sky-900 text-white">Book coaching</button>
        </aside>
      </main>
    </div>
  );
}

function ModuleList() {
  const modules = [
    { id: 1, title: 'Foundations: What EQ Is & Why It Matters' },
    { id: 2, title: 'Self-Awareness & Managing Reactivity' },
    { id: 3, title: 'Social Awareness & Empathy at Work' },
    { id: 4, title: 'Influence: Communication that Lands' },
    { id: 5, title: 'Conflict, Feedback & Difficult Conversations' },
    { id: 6, title: 'Sustaining Growth: Habits & Leadership EQ' },
  ];
  return (
    <div className="mt-6 space-y-3">
      {modules.map(m => (
        <div key={m.id} className="p-3 border rounded flex justify-between items-center">
          <div>
            <div className="font-medium">Module {m.id}: {m.title}</div>
            <div className="text-xs text-gray-500">~20-35 minutes each (videos + worksheet)</div>
          </div>
          <Link to={`/course/module/${m.id}`} className="px-3 py-1 border rounded">Open</Link>
        </div>
      ))}
    </div>
  );
}

function CourseRouter() {
  return (
    <Routes>
      <Route path="/" element={<CourseHome />} />
      <Route path="/module/:id" element={<ModulePlayer />} />
    </Routes>
  );
}

function CourseHome() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold">Course Home</h2>
      <p className="mt-3 text-gray-600">Start the course where you left off or pick a module below.</p>
      <ModuleList />
    </div>
  );
}

function ModulePlayer() {
  // in production, fetch module content by id from server
  const { pathname } = window.location;
  const id = pathname.split('/').pop();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link to="/dashboard">← Back to dashboard</Link>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-6 bg-white rounded shadow">
        <h3 className="text-xl font-semibold">Module {id} — Title Placeholder</h3>
        <div className="mt-4">
          <div className="aspect-video bg-black rounded flex items-center justify-center text-white">Video player placeholder</div>
          <div className="mt-4 space-y-3">
            <a className="block underline">Download worksheet (PDF)</a>
            <div className="text-sm text-gray-600">Mark complete when finished to track progress.</div>
            <button className="mt-3 px-3 py-2 rounded bg-sky-900 text-white">Mark complete</button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Root app with routes
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/*" element={<CourseRouter />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

/*
Deployment & next steps (developer notes):

1) Backend (required)
   - Implement endpoints listed at top. Use Stripe server SDK to create Checkout Sessions and return session URL or ID.
   - Implement secure user auth (JWT or session). Store course purchases and enrollment status.
   - Store freebie subscribers in Mailchimp/ConvertKit or your CRM.

2) Hosting
   - Frontend: Vercel, Netlify, or any static host for React with client-side routing support.
   - Backend: Vercel Serverless, Heroku, Render, or your preferred server. Keep Stripe secret keys in server env.

3) Payments
   - Use Stripe Checkout for easiest PCI scope. Create one-time price in Stripe and use its price ID in create-checkout.
   - After successful checkout, set up Stripe webhook to grant course access to the purchaser.

4) Content & Storage
   - Host video files on Vimeo Pro, Wistia, or private S3 with signed URLs. Do NOT host large videos directly on your server.
   - Worksheets/PDFs can be stored in S3 or your CMS.

5) Emailing
   - Use an email provider to deliver the freebie (via direct link or transactional email). Use webhook to add buyer/subscriber tags.

6) Security
   - Protect course module endpoints so only enrolled users access videos & files.
   - Always validate Stripe webhooks with signing secret.

7) Analytics & Marketing
   - Add tracking scripts (Google Analytics / GA4, Facebook Pixel) in your production app for conversions.

This repo file is a single-file starter. I recommend splitting into components, adding TypeScript, and connecting a robust auth + payments backend before going live.
*/
