const Incident = require('../models/Incident');

// 1. Create a New Cloud Incident (FR3)
exports.createIncident = async (req, res) => {
  try {
    const { title, description, cloudService, severity } = req.body;

    // req.user.id is automatically populated by our authMiddleware!
    const newIncident = new Incident({
      title,
      description,
      cloudService,
      severity,
      reportedBy: req.user.id
    });

    const savedIncident = await newIncident.save();
    res.status(201).json(savedIncident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get All Incidents (FR7 / Dashboard view)
exports.getAllIncidents = async (req, res) => {
  try {
    // Populate user details (username and role) instead of just showing raw IDs
    const incidents = await Incident.find()
      .populate('reportedBy', 'username role')
      .populate('assignedTo', 'username role');

    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Update Incident Status / Assignment (FR4 / FR5 / FR6)
exports.updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, severity, assignedTo } = req.body;

    const updatedIncident = await Incident.findByIdAndUpdate(
      id,
      { status, severity, assignedTo },
      { new: true, runValidators: true } // Returns the fresh updates and reruns checks
    );

    if (!updatedIncident) {
      return res.status(404).json({ message: 'Incident profile not found' });
    }

    res.status(200).json(updatedIncident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 4. Delete Incident (Admin Only)
exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({ message: 'Incident successfully purged from cloud records' });
  } catch (error) {
    res.status(500).json({ message: 'Server error eliminating incident records', error: error.message });
  }
};