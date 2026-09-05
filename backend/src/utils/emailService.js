const nodemailer = require("nodemailer");
const { getWelcomeTemplate } = require("./emailTemplates");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const sendWelcomeEmail = async (user) => {
  const { subject, html } = getWelcomeTemplate(user);

  await transporter.sendMail({
    from: "SkillBridge <noreply@skillbridge.pk>",
    to: user.email,
    subject,
    html,
  });

  console.log(`✅ Welcome email sent to ${user.email}`);
};

module.exports = { sendWelcomeEmail };