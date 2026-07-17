// ============================================================
//  EXISTING UI HELPERS (Canvas, Ticker, Scroll, FAQ, Menu)
// ============================================================

// 1. Canvas: Starfield + Orbs
(function() {
    const canvas = document.getElementById('canvas-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let orbs = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 180; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.5 + 0.5,
            a: Math.random() * 0.8 + 0.2,
            speed: Math.random() * 0.005 + 0.002
        });
    }

    const orbColors = [
        'rgba(124,58,237,0.04)',
        'rgba(26,58,138,0.06)',
        'rgba(30,64,175,0.04)',
        'rgba(125,211,252,0.02)'
    ];
    for (let i = 0; i < 6; i++) {
        orbs.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 200 + 80,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            color: orbColors[i % orbColors.length]
        });
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        for (let orb of orbs) {
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
            ctx.fillStyle = orb.color;
            ctx.fill();
            orb.x += orb.dx;
            orb.y += orb.dy;
            if (orb.x < -orb.r || orb.x > width + orb.r) orb.dx *= -1;
            if (orb.y < -orb.r || orb.y > height + orb.r) orb.dy *= -1;
        }
        for (let star of stars) {
            star.a += (Math.random() - 0.5) * 0.02;
            star.a = Math.min(0.9, Math.max(0.1, star.a));
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${star.a})`;
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

// 2. Live Price Ticker
(function() {
    const container = document.getElementById('tickerInner');
    if (!container) return;
    const coins = [
        { name: 'Bitcoin', sym: 'BTC', price: 67420, change: 2.4 },
        { name: 'Ethereum', sym: 'ETH', price: 3520, change: -1.2 },
        { name: 'USDT', sym: 'USDT', price: 0.999, change: 0.01 },
        { name: 'BNB', sym: 'BNB', price: 598, change: 3.1 },
        { name: 'Solana', sym: 'SOL', price: 172, change: 5.6 },
        { name: 'Cardano', sym: 'ADA', price: 0.46, change: -0.8 },
        { name: 'Polkadot', sym: 'DOT', price: 7.2, change: 1.9 },
        { name: 'Chainlink', sym: 'LINK', price: 14.8, change: -2.5 },
    ];
    const items = [...coins, ...coins];
    container.innerHTML = items.map(c => {
        const cls = c.change >= 0 ? 'up' : 'down';
        const sign = c.change >= 0 ? '+' : '';
        return `
            <div class="ticker-item">
                <span class="coin">${c.sym}</span>
                <span class="price">$${c.price.toFixed(2)}</span>
                <span class="change ${cls}">${sign}${c.change}%</span>
            </div>
        `;
    }).join('');
})();

// 3. Scroll Reveal (fade-up)
(function() {
    const faders = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    faders.forEach(el => observer.observe(el));
})();

// 4. FAQ Accordion
(function() {
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
})();

// 5. Mobile Menu Toggle
(function() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('open');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });
    }
})();

// ============================================================
//  SUPABASE CLIENT & AUTH FUNCTIONS (NEW)
// ============================================================
(function() {
    'use strict';

    // ------------------------------------------------------------------
    // 1. CONFIGURATION – REPLACE THESE WITH YOUR SUPABASE PROJECT VALUES
    // ------------------------------------------------------------------
    const SUPABASE_URL = 'https://agscnbiwmotspzjbosmr.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnc2NuYml3bW90c3B6amJvc21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyODQxNzksImV4cCI6MjA5OTg2MDE3OX0.tsG16bCY-KX5fSH2JoLI9DtO0n7MOt49UdKBnLvD4e8';

    // Check if Supabase library is loaded
    if (typeof supabase === 'undefined') {
        console.warn('Supabase library not loaded. Auth functions will not work.');
        return;
    }

    // Initialize Supabase client
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ------------------------------------------------------------------
    // 2. AUTH FUNCTIONS (exposed globally via window.supabaseClient)
    // ------------------------------------------------------------------
    const auth = {

        // ---- Sign Up ----
        async signUp(email, password, name) {
            try {
                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { name },
                        emailRedirectTo: window.location.origin + '/login.html',
                    },
                });

                if (error) {
                    console.error('Signup error:', error.message);
                    return { success: false, message: 'Unable to create account.' };
                }

                // Create profile record
                if (data.user) {
                    await supabaseClient
                        .from('profiles')
                        .insert([{ id: data.user.id, email, name }]);
                }

                return { success: true, user: data.user };
            } catch (err) {
                console.error('Signup exception:', err);
                return { success: false, message: 'Unable to create account.' };
            }
        },

        // ---- Sign In ----
        async signIn(email, password) {
            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    console.error('Login error:', error.message);
                    return { success: false, message: 'Incorrect details.' };
                }

                // Update last login
                if (data.user) {
                    await supabaseClient
                        .from('profiles')
                        .update({ last_login_at: new Date().toISOString() })
                        .eq('id', data.user.id);
                }

                return { success: true, user: data.user, session: data.session };
            } catch (err) {
                console.error('Login exception:', err);
                return { success: false, message: 'Incorrect details.' };
            }
        },

        // ---- Sign Out ----
        async signOut() {
            const { error } = await supabaseClient.auth.signOut();
            if (error) console.error('Signout error:', error);
            sessionStorage.clear();
            window.location.href = 'login.html';
        },

        // ---- Get Current User ----
        async getCurrentUser() {
            const { data, error } = await supabaseClient.auth.getUser();
            if (error || !data.user) return null;
            return data.user;
        },

        // ---- Check if user is authenticated ----
        async isAuthenticated() {
            const { data } = await supabaseClient.auth.getSession();
            return !!data.session;
        },

        // ---- Store user in sessionStorage (client-side) ----
        storeSession(user) {
            sessionStorage.setItem('user', JSON.stringify(user));
        },

        getSession() {
            const stored = sessionStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        },

        clearSession() {
            sessionStorage.clear();
        },

        // ---- Protect route ----
        async requireAuth() {
            const session = this.getSession();
            if (session) return session;

            const { data } = await supabaseClient.auth.getSession();
            if (!data.session) {
                window.location.href = 'login.html';
                return null;
            }
            this.storeSession(data.session.user);
            return data.session.user;
        },

        // ---- OTP (2FA) Functions ----
        async sendOtp(email, purpose = 'login') {
            try {
                const code = String(Math.floor(100000 + Math.random() * 900000));
                const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

                await supabaseClient
                    .from('otps')
                    .insert([{ email, code, expires_at: expiresAt }]);

                console.log(`📧 OTP for ${email}: ${code}`);
                // In production, send email via Supabase Edge Function or third-party

                return { success: true, message: 'Verification code sent.' };
            } catch (err) {
                console.error('OTP send error:', err);
                return { success: false, message: 'Unable to send verification code.' };
            }
        },

        async verifyOtp(email, code) {
            try {
                const { data, error } = await supabaseClient
                    .from('otps')
                    .select('*')
                    .eq('email', email)
                    .eq('verified', false)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (error || !data || data.length === 0) {
                    return { success: false, message: 'Invalid code.' };
                }

                const otp = data[0];

                // Check expiration
                if (new Date(otp.expires_at) < new Date()) {
                    return { success: false, message: 'Code expired. Request a new one.' };
                }

                // Check attempts
                if (otp.attempts >= 5) {
                    return { success: false, message: 'Too many attempts. Request a new code.' };
                }

                // Increment attempts
                await supabaseClient
                    .from('otps')
                    .update({ attempts: otp.attempts + 1 })
                    .eq('id', otp.id);

                // Verify
                if (otp.code !== code) {
                    return { success: false, message: 'Invalid code.' };
                }

                // Mark as verified
                await supabaseClient
                    .from('otps')
                    .update({ verified: true })
                    .eq('id', otp.id);

                return { success: true };
            } catch (err) {
                console.error('OTP verify error:', err);
                return { success: false, message: 'Invalid code.' };
            }
        },

        async resendOtp(email) {
            // Invalidate old OTPs
            await supabaseClient
                .from('otps')
                .update({ verified: true })
                .eq('email', email)
                .eq('verified', false);

            return await this.sendOtp(email);
        },

        // Expose raw Supabase client for advanced use
        get supabase() {
            return supabaseClient;
        }
    };

    // Expose to global scope
    window.supabaseClient = auth;

    console.log('✅ Supabase auth module loaded');
})();