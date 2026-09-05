const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SkillBridge</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6c63ff 0%, #4f46e5 100%); padding: 36px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 4px; }
    .body { padding: 40px; }
    .greeting { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 12px; }
    .message { font-size: 15px; color: #4a5568; line-height: 1.7; margin-bottom: 24px; }
    .badge { display: inline-block; background: #ede9fe; color: #6c63ff; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 20px; margin-bottom: 28px; text-transform: capitalize; }
    .features { background: #f8f7ff; border-radius: 10px; padding: 24px; margin-bottom: 28px; }
    .features h3 { font-size: 14px; font-weight: 700; color: #6c63ff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; }
    .feature-item { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .feature-item:last-child { margin-bottom: 0; }
    .icon { font-size: 18px; margin-right: 12px; min-width: 24px; }
    .feature-text { font-size: 14px; color: #4a5568; line-height: 1.5; }
    .feature-text strong { color: #1a1a2e; }
    .cta { text-align: center; margin-bottom: 28px; }
    .cta a { background: linear-gradient(135deg, #6c63ff 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block; }
    .footer { border-top: 1px solid #e8e8f0; padding: 24px 40px; text-align: center; }
    .footer p { font-size: 13px; color: #9ca3af; line-height: 1.6; }
    .footer a { color: #6c63ff; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎯 SkillBridge</h1>
      <p>Pakistan's Proof-of-Skill Platform</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>
        Koi sawal hai? <a href="mailto:info@skillbridge.pk">info@skillbridge.pk</a><br/>
        <br/>
        © 2025 SkillBridge · Karachi, Pakistan
      </p>
    </div>
  </div>
</body>
</html>
`;

const studentTemplate = ({ name }) => {
  const content = `
    <p class="greeting">Shukriya, ${name}! 🎉</p>
    <p class="message">
      Tumhara SkillBridge account successfully ban gaya hai. Ab tum apni real skills prove kar sako ge — 
      sirf resume ka bharosa nahi, actual Proof-of-Skill ke zariye.
    </p>
    <span class="badge">👨‍🎓 Student Account</span>
    <div class="features">
      <h3>Tumhare liye kya available hai</h3>
      <div class="feature-item">
        <span class="icon">🧭</span>
        <div class="feature-text"><strong>AI Career Compass</strong> — apni profile ke hisaab se best career paths discover karo</div>
      </div>
      <div class="feature-item">
        <span class="icon">🔍</span>
        <div class="feature-text"><strong>Skill Gap Engine</strong> — pata karo kahan kamine ho aur kya sikhna hai</div>
      </div>
      <div class="feature-item">
        <span class="icon">💻</span>
        <div class="feature-text"><strong>Proof-of-Skill Engine</strong> — GitHub + live coding + quiz se real skills validate karo</div>
      </div>
      <div class="feature-item">
        <span class="icon">🗣️</span>
        <div class="feature-text"><strong>AI Mock Interview</strong> — technical + soft skills dono ki practice karo</div>
      </div>
      <div class="feature-item">
        <span class="icon">🛂</span>
        <div class="feature-text"><strong>Verified Skill Passport</strong> — ek shareable link jo tumhari real ability prove kare</div>
      </div>
    </div>
    <div class="cta">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard">Dashboard Kholein →</a>
    </div>
  `;
  return {
    subject: "SkillBridge mein khush aamdeed! 🎯",
    html: baseTemplate(content),
  };
};

const recruiterTemplate = ({ name, company }) => {
  const content = `
    <p class="greeting">Welcome aboard, ${name}! 🤝</p>
    <p class="message">
      Tumhara SkillBridge Recruiter account ready hai. Ab sirf resume nahi — 
      verified skills, GitHub evidence, aur live assessment results dekh ke hire karo.
    </p>
    <span class="badge">🏢 Recruiter Account${company ? ` · ${company}` : ""}</span>
    <div class="features">
      <h3>Tumhare liye kya available hai</h3>
      <div class="feature-item">
        <span class="icon">📋</span>
        <div class="feature-text"><strong>Job Posting</strong> — real openings post karo, LLM automatically skill tags extract karega</div>
      </div>
      <div class="feature-item">
        <span class="icon">📊</span>
        <div class="feature-text"><strong>Market Intelligence</strong> — Pakistan-specific, live skill demand data</div>
      </div>
      <div class="feature-item">
        <span class="icon">🛂</span>
        <div class="feature-text"><strong>Skill Passports</strong> — verified candidates dhundho, resume ke claims pe rely mat karo</div>
      </div>
      <div class="feature-item">
        <span class="icon">⚡</span>
        <div class="feature-text"><strong>Pre-verified Pool</strong> — jitne zyada students verify honge, utni better hiring quality</div>
      </div>
    </div>
    <div class="cta">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/recruiter/dashboard">Recruiter Dashboard →</a>
    </div>
  `;
  return {
    subject: "SkillBridge Recruiter Account Ready! 🚀",
    html: baseTemplate(content),
  };
};

const getWelcomeTemplate = (user) => {
  if (user.role === "recruiter") return recruiterTemplate(user);
  return studentTemplate(user);
};

module.exports = { getWelcomeTemplate };