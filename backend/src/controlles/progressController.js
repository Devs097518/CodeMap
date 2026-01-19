const UserProgress = require('../models/UserProgress');

exports.updateProgress = async (req, res) => {
  try {
    const { itemId, status } = req.body;
    const userId = req.userId;

    if (!itemId || !status) {
      return res.status(400).json({ error: 'ItemId e status são obrigatórios' });
    }

    const validStatuses = ['not-started', 'studying', 'completed', 'ignored'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const progress = await UserProgress.updateStatus(userId, itemId, status);
    res.json({
      message: 'Progresso atualizado',
      progress
    });
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    res.status(500).json({ error: 'Erro ao atualizar progresso' });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.userId;

    const progress = await UserProgress.getUserProgress(userId, roadmapId);
    res.json(progress);
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({ error: 'Erro ao buscar progresso' });
  }
};