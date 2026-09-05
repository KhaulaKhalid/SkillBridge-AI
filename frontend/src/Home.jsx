import { Link } from "react-router-dom";
import "./css/Home.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
function App() {
  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="logo">
          Skill<span>Bridge</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#how">How It Works</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="nav-login">
            Login
          </Link>

          <Link to="/register" className="nav-start">
            Get Started →
          </Link>
        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="hero-badge">
            ✦ AI-Powered Career Platform
          </div>

          <h1>
            Discover Your
            <br />
            <span>Career Potential.</span>
          </h1>

          <p>
            SkillsBridge uses AI to analyze your skills, discover
            your career gaps and create a personalized roadmap
            to help you become job ready.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="primary-btn">
              Start Your Career Journey →
            </Link>

            <a href="#features" className="outline-btn">
              Explore Features
            </a>

          </div>

          <div className="hero-trust">
            <div className="avatars">
              <span>👩</span>
              <span>👨</span>
              <span>👩</span>
              <span>👨</span>
            </div>

            <div>
              <strong>1,000+ Learners</strong>
              <small>already discovering their potential</small>
            </div>
          </div>

        </div>


        {/* ================= AI VISUAL ================= */}
        <div className="hero-visual">

          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>

          <div className="ai-card">

            <div className="ai-top">

              <div>
                <small>AI CAREER ANALYSIS</small>
                <h3>Your Career Score</h3>
              </div>

              <div className="ai-status">
                ● AI
              </div>

            </div>


            <div className="score">

              <div className="score-circle">
                <span>82</span>
                <small>/100</small>
              </div>

              <div className="score-info">
                <strong>Excellent Progress</strong>

                <p>
                  You're on the right path.
                  Keep improving your skills.
                </p>
              </div>

            </div>


            <div className="progress-item">

              <div>
                <span>Technical Skills</span>
                <b>88%</b>
              </div>

              <div className="progress">
                <span style={{ width: "88%" }}></span>
              </div>

            </div>


            <div className="progress-item">

              <div>
                <span>Communication</span>
                <b>76%</b>
              </div>

              <div className="progress">
                <span style={{ width: "76%" }}></span>
              </div>

            </div>


            <div className="progress-item">

              <div>
                <span>Problem Solving</span>
                <b>82%</b>
              </div>

              <div className="progress">
                <span style={{ width: "82%" }}></span>
              </div>

            </div>


            <div className="ai-recommendation">

              <span>✦</span>

              <div>
                <strong>AI Recommendation</strong>
                <p>Improve System Design to reach 90%</p>
              </div>

            </div>

          </div>

        </div>

      </section>


     {/* ================= HOW IT WORKS ================= */}
<section className="how-section" id="how">

  <div className="section-title">

    <span>YOUR JOURNEY</span>

    <h2>
      From Skills to
      <br />
      <strong>Career Success.</strong>
    </h2>

    <p>
      Our intelligent platform guides you through every
      step of your career journey.
    </p>

  </div>

  <div className="steps">

    {/* 01 */}
    <Link to="/profile" className="step-card">

      <span className="step-number">01</span>

      <div className="step-icon">✦</div>

      <h3>Build Your Profile</h3>

      <p>
        Tell us about your education, skills,
        interests and experience.
      </p>

    </Link>


    {/* 02 */}
    <Link to="/skill-analysis" className="step-card">

      <span className="step-number">02</span>

      <div className="step-icon">◈</div>

      <h3>Analyze Your Skills</h3>

      <p>
        Our AI evaluates your strengths and
        current skill level.
      </p>

    </Link>


    {/* 03 */}
    <Link to="/skill-gaps" className="step-card">

      <span className="step-number">03</span>

      <div className="step-icon">⌁</div>

      <h3>Discover Your Gaps</h3>

      <p>
        Identify the skills you need to achieve
        your desired career.
      </p>

    </Link>


    {/* 04 */}
    <Link to="/ai-roadmap" className="step-card">

      <span className="step-number">04</span>

      <div className="step-icon">↗</div>

      <h3>Follow Your AI Roadmap</h3>

      <p>
        Get a personalized learning roadmap
        designed for you.
      </p>

    </Link>


    {/* 05 */}
    <Link to="/job-ready" className="step-card">

      <span className="step-number">05</span>

      <div className="step-icon">✓</div>

      <h3>Become Job Ready</h3>

      <p>
        Prepare your resume, practice interviews
        and discover relevant jobs.
      </p>

    </Link>

  </div>

</section>
      {/* ================= FEATURES ================= */}
      <section className="features-section" id="features">

        <div className="section-title center">

          <span>POWERFUL FEATURES</span>

          <h2>
            Everything You Need
            <br />
            to <strong>Move Forward.</strong>
          </h2>

          <p>
            Smart tools designed to understand you,
            guide you and prepare you for the real world.
          </p>

        </div>


        <div className="feature-grid">


          {/* AI CAREER ASSESSMENT */}
          <Link to="/assessment" className="feature-card featured">

            <div className="feature-icon">✦</div>

            <h3>AI Career Assessment</h3>

            <p>
              Discover career paths that match your
              skills, interests and potential.
            </p>

            <span>Explore Assessment →</span>

          </Link>


          {/* RESUME ANALYSIS */}
          <Link to="/resume-analysis" className="feature-card">

            <div className="feature-icon">▣</div>

            <h3>Resume Analysis</h3>

            <p>
              Get AI-powered feedback and improve
              your resume instantly.
            </p>

            <span>Analyze Resume →</span>

          </Link>


          {/* SKILL GAP */}
          <Link to="/skill-gaps" className="feature-card">

            <div className="feature-icon">⌁</div>

            <h3>Skill Gap Detection</h3>

            <p>
              Find exactly which skills are missing
              from your target career.
            </p>

            <span>Find Your Gaps →</span>

          </Link>


          {/* JOB MATCHING */}
<Link to="/job-matching" className="feature-card">
  <div className="feature-icon">◉</div>

  <h3>Job Matching</h3>

  <p>
    Discover jobs that match your skills
    and career goals.
  </p>

  <span>Find Jobs →</span>
</Link>

          {/* GITHUB */}
          <Link to="/github" className="feature-card">

            <div className="feature-icon">⌘</div>

            <h3>GitHub Verification</h3>

            <p>
              Verify your technical skills through
              your real GitHub projects.
            </p>

            <span>Verify Skills →</span>

          </Link>


          {/* MOCK INTERVIEW */}
          <Link to="/mock-interview" className="feature-card">

            <div className="feature-icon">◌</div>

            <h3>AI Mock Interviews</h3>

            <p>
              Practice realistic interviews and
              receive instant AI feedback.
            </p>

            <span>Practice Interview →</span>

          </Link>


        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="final-cta">

        <div className="cta-glow"></div>

        <div className="cta-content">

          <span>YOUR FUTURE STARTS HERE</span>

          <h2>
            Ready to discover
            <br />
            your <strong>career path?</strong>
          </h2>

          <p>
            Take the first step toward understanding
            your potential and building your future.
          </p>

          <Link to="/register" className="primary-btn">
            Start Your Career Journey →
          </Link>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer>

        <div className="footer-main">

          <div>

            <div className="logo">
              Skill<span>Bridge</span>
            </div>

            <p>
              AI-powered career guidance for
              the next generation.
            </p>

          </div>


          <div className="footer-links">

            <a href="#home">Home</a>
            <a href="#how">How It Works</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>

          </div>

        </div>


        <div className="footer-bottom">
          © 2026 SkillsBridge. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

export default App; 