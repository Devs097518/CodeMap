const Roadmap = require('../models/Roadmap');
const UserProgress = require('../models/UserProgress');

exports.getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.getAll();
    
    // Se o usuário estiver autenticado, incluir progresso
    if (req.userId) {
      const progressData = await UserProgress.getAllUserProgress(req.userId);
      
      const roadmapsWithProgress = roadmaps.map(roadmap => {
        const progress = progressData.find(p => p.roadmap_id === roadmap.id);
        return {
          ...roadmap,
          progress: progress || {
            total_items: 0,
            completed_items: 0,
            studying_items: 0
          }
        };
      });
      
      return res.json(roadmapsWithProgress);
    }
    
    res.json(roadmaps);
  } catch (error) {
    console.error('Erro ao buscar roadmaps:', error);
    res.status(500).json({ error: 'Erro ao buscar roadmaps' });
  }
};

exports.getRoadmapById = async (req, res) => {
  try {
    const { id } = req.params;
    const roadmap = await Roadmap.getById(id);

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap não encontrado' });
    }

    // Se usuário autenticado, buscar progresso
    if (req.userId) {
      const progress = await UserProgress.getUserProgress(req.userId, id);
      roadmap.items = roadmap.items.map(item => {
        const itemProgress = progress.find(p => p.id === item.id);
        return {
          ...item,
          status: itemProgress ? itemProgress.status : 'not-started'
        };
      });
    }

    res.json(roadmap);
  } catch (error) {
    console.error('Erro ao buscar roadmap:', error);
    res.status(500).json({ error: 'Erro ao buscar roadmap' });
  }
};

exports.createRoadmap = async (req, res) => {
  try {
    const { title, description, items } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    const roadmap = await Roadmap.create({ title, description, items });
    res.status(201).json(roadmap);
  } catch (error) {
    console.error('Erro ao criar roadmap:', error);
    res.status(500).json({ error: 'Erro ao criar roadmap' });
  }
};