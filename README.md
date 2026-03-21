<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ET Edge | AI-Driven Financial Intelligence</title>
    <style>
        :root {
            --bg-dark: #0f172a;
            --bg-card: rgba(30, 41, 59, 0.7);
            --primary: #3b82f6;
            --secondary: #8b5cf6;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-main);
            margin: 0;
            padding: 0;
            line-height: 1.6;
            overflow-x: hidden;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .hero {
            text-align: center;
            padding: 6rem 1rem;
            position: relative;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: -50%;
            left: 50%;
            transform: translateX(-50%);
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(15,23,42,0) 70%);
            z-index: -1;
            pointer-events: none;
        }

        h1 {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(to right, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p.subtitle {
            font-size: 1.25rem;
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto 3rem;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 4rem;
        }

        .card {
            background: var(--bg-card);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            padding: 2rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.5);
            border-color: rgba(59, 130, 246, 0.5);
        }

        .card h3 {
            font-size: 1.5rem;
            margin-top: 0;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .card p {
            color: var(--text-muted);
            font-size: 0.95rem;
            margin-bottom: 0;
        }

        .badge {
            display: inline-block;
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .tech-stack {
            margin-top: 5rem;
            padding: 3rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 1rem;
            text-align: center;
        }

        .tech-icons {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 2rem;
            flex-wrap: wrap;
        }

        .tech-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .interactive-demo {
            margin-top: 4rem;
            padding: 2rem;
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 1rem;
            text-align: center;
            background: radial-gradient(circle at center, rgba(139, 92, 246, 0.1), transparent);
        }

        button {
            background: linear-gradient(to right, var(--primary), var(--secondary));
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        button:hover {
            opacity: 0.9;
        }

        #status-display {
            margin-top: 1rem;
            font-family: monospace;
            color: #34d399;
            min-height: 24px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="hero">
            <div class="badge">v1.0.0-beta</div>
            <h1>ET Edge</h1>
            <p class="subtitle">Next-Generation AI-Driven Financial Intelligence Platform. Analyze, predict, and visualize market dynamics with unprecedented precision.</p>
        </header>

        <main>
            <div class="grid">
                <article class="card" onclick="triggerEffect(this)">
                    <h3>🔍 AI Event Detection Engine</h3>
                    <p>Scans real-time global news, filings, and social chatter to identify market-moving events before they price in.</p>
                </article>

                <article class="card" onclick="triggerEffect(this)">
                    <h3>⚡ Event-to-Impact Mapper</h3>
                    <p>Quantifies the potential shockwaves of events across various asset classes, sectors, and supply chains.</p>
                </article>

                <article class="card" onclick="triggerEffect(this)">
                    <h3>🎯 Finfluencer BS-Detector</h3>
                    <p>Cross-references financial influencer claims with historical data, SEC filings, and mathematical models to verify credibility.</p>
                </article>

                <article class="card" onclick="triggerEffect(this)">
                    <h3>📊 Portfolio Simulator & What-If Engine</h3>
                    <p>Stress-test your portfolio against black swan events and hypothetical macro scenarios in real-time.</p>
                </article>

                <article class="card" onclick="triggerEffect(this)">
                    <h3>🧠 Explainability Dashboard & Chart Intelligence</h3>
                    <p>Transparent AI reasoning. See exactly why the model made a prediction with deep-dive chart annotations.</p>
                </article>

                <article class="card" onclick="triggerEffect(this)">
                    <h3>🎬 AI Market Video Engine</h3>
                    <p>Automatically generates concise, actionable video briefings summarizing complex market conditions and portfolio risk.</p>
                </article>
            </div>

            <section class="interactive-demo">
                <h2>System Diagnostics Simulator</h2>
                <p>Run a mock initialization sequence of the ET Edge core engines.</p>
                <button onclick="runDiagnostics()">Initialize ET Edge Core</button>
                <div id="status-display"></div>
            </section>

            <section class="tech-stack">
                <h2>Built With Modern Web Standards</h2>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Powering high-frequency data processing and real-time UI</p>
                <div class="tech-icons">
                    <div class="tech-item"><span>⚛️</span> React / TSX</div>
                    <div class="tech-item"><span>🚀</span> Vite</div>
                    <div class="tech-item"><span>🎨</span> TailwindCSS</div>
                    <div class="tech-item"><span>🤖</span> Validation Agents</div>
                </div>
            </section>
        </main>
    </div>

    <script>
        // Interactive Scripting for README Demo
        function triggerEffect(element) {
            element.style.transform = 'scale(0.98)';
            setTimeout(() => {
                element.style.transform = '';
            }, 150);
        }

        async function runDiagnostics() {
            const display = document.getElementById('status-display');
            const button = document.querySelector('.interactive-demo button');
            
            button.disabled = true;
            button.style.opacity = '0.5';
            display.style.color = '#34d399';
            
            const steps = [
                "[ OK ] Connecting to Market Data Stream...",
                "[ OK ] Initializing WhatIfScenarioEngine...",
                "[ OK ] Calibrating ChartIntelligence Models...",
                "[ OK ] Bootstrapping AIVideoEngine Pipelines...",
                "[ OK ] Loading Finfluencer BS-Detector Weights...",
                "✅ All Systems Operational. Ready for inference."
            ];

            display.innerHTML = '';
            
            for(let i = 0; i < steps.length; i++) {
                await new Promise(r => setTimeout(r, 600));
                display.innerHTML = steps[i];
            }

            setTimeout(() => {
                display.innerHTML = '';
                button.disabled = false;
                button.style.opacity = '1';
            }, 3000);
        }
        
        // Add a subtle entrance animation
        window.addEventListener('load', () => {
            const cards = document.querySelectorAll('.card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.5s ease ' + (index * 0.1) + 's';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            });
        });
    </script>
</body>
</html>
