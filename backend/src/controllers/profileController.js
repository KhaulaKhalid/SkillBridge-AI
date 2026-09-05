const UserProfile = require('../models/UserProfile');
const { generateAICareerProfile } = require('../services/aiProfileService');

// POST /api/profile
// Creates the raw profile (no AI enrichment yet).
async function createProfile(req, res) {
  try {
    const { userId, fullName, education, claimedSkills, interests, careerGoals, resumeText, githubUsername } =
      req.body;

    if (!userId || !fullName) {
      return res.status(400).json({ error: 'userId and fullName are required.' });
    }

    const existing = await UserProfile.findOne({ user: userId });
    if (existing) {
      return res.status(409).json({ error: 'Profile already exists for this user. Use PUT to update it.' });
    }

    const profile = new UserProfile({
      user: userId,
      fullName,
      education,
      claimedSkills,
      interests,
      careerGoals,
      resumeText,
      githubUsername,
    });
    profile.calculateCompleteness();
    await profile.save();

    return res.status(201).json(profile);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create profile.', details: err.message });
  }
}

// GET /api/profile/:userId
async function getProfile(req, res) {
  try {
    const profile = await UserProfile.findOne({ user: req.params.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch profile.', details: err.message });
  }
}

// PUT /api/profile/:userId
async function updateProfile(req, res) {
  try {
    const profile = await UserProfile.findOne({ user: req.params.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    const editableFields = [
      'fullName',
      'education',
      'claimedSkills',
      'interests',
      'careerGoals',
      'resumeText',
      'githubUsername',
    ];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) profile[field] = req.body[field];
    });

    profile.calculateCompleteness();
    await profile.save();

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile.', details: err.message });
  }
}

// POST /api/profile/:userId/generate
// Runs the LLM enrichment step and stores the result on aiCareerProfile.
async function generateProfile(req, res) {
  try {
    const profile = await UserProfile.findOne({ user: req.params.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    if (profile.profileCompleteness < 40) {
      return res.status(400).json({
        error: 'Profile is too incomplete to generate a meaningful AI Career Profile.',
        profileCompleteness: profile.profileCompleteness,
      });
    }

    const aiResult = await generateAICareerProfile({
      fullName: profile.fullName,
      education: profile.education,
      claimedSkills: profile.claimedSkills,
      interests: profile.interests,
      careerGoals: profile.careerGoals,
      resumeText: profile.resumeText,
    });

    profile.aiCareerProfile = { ...aiResult, generatedAt: new Date() };
    await profile.save();

    return res.json(profile);
  } catch (err) {
    return res.status(502).json({ error: 'AI profile generation failed.', details: err.message });
  }
}

module.exports = { createProfile, getProfile, updateProfile, generateProfile };