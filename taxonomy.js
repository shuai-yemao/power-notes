window.POWER_TAXONOMY = [
  {
    id: 'embedded', label: '嵌入式', children: [
      { id: 'fundamentals', label: '基础概念', children: [
        { id: 'mcu-boot', label: 'MCU 与启动' },
        { id: 'memory-linker', label: '内存与链接' }
      ] },
      { id: 'realtime', label: '实时系统', children: [
        { id: 'freertos', label: 'FreeRTOS', children: [
          { id: 'task-design', label: '任务与调度' },
          { id: 'sync-communication', label: '同步与通信' }
        ] }
      ] },
      { id: 'architecture', label: '软件架构', children: [
        { id: 'platform-impl', label: 'Platform / Service / Impl', children: [
          { id: 'boundary', label: '边界与契约' },
          { id: 'dependency', label: '依赖与组合' }
        ] }
      ] },
      { id: 'drivers-middleware', label: '驱动与中间件', children: [
        { id: 'peripheral-drivers', label: '外设驱动' },
        { id: 'storage-communication', label: '存储与通信' }
      ] }
    ]
  },
  {
    id: 'software', label: '软件工程', children: [
      { id: 'architecture', label: '架构设计', children: [
        { id: 'layering', label: '分层与模块化' },
        { id: 'interfaces', label: '接口与依赖' }
      ] },
      { id: 'quality', label: '代码质量', children: [
        { id: 'review', label: '代码审查', children: [
          { id: 'method', label: 'Review 方法' },
          { id: 'risk-acceptance', label: '风险与验收' }
        ] }
      ] },
      { id: 'delivery', label: '协作与交付', children: [
        { id: 'git-versioning', label: 'Git 与版本' },
        { id: 'testing-release', label: '测试与发布' }
      ] }
    ]
  },
  {
    id: 'tools', label: '工具与方法', children: [
      { id: 'knowledge', label: '知识管理', children: [
        { id: 'markdown', label: 'Markdown', children: [
          { id: 'file-metadata', label: '文件与元数据' },
          { id: 'links-search', label: '链接与检索' }
        ] }
      ] },
      { id: 'development-tools', label: '开发工具', children: [
        { id: 'codex-ai', label: 'Codex / AI' },
        { id: 'obsidian', label: 'Obsidian' }
      ] },
      { id: 'automation', label: '自动化工作流', children: [
        { id: 'repeatable-tasks', label: '可重复任务' },
        { id: 'local-sync', label: '本地同步' }
      ] }
    ]
  },
  {
    id: 'thinking', label: '思考与随笔', children: [
      { id: 'reading', label: '阅读记录', children: [
        { id: 'technical-reading', label: '技术阅读' },
        { id: 'general-reading', label: '非技术阅读' }
      ] },
      { id: 'retrospective', label: '复盘', children: [
        { id: 'engineering-review', label: '工程复盘' },
        { id: 'learning-review', label: '学习复盘' }
      ] },
      { id: 'life-observation', label: '生活观察', children: [
        { id: 'daily', label: '日常' },
        { id: 'long-termism', label: '长期主义' }
      ] }
    ]
  }
];

function taxonomyIds(path) {
  return Array.isArray(path) ? path : String(path || '').split('/').filter(Boolean);
}

window.findTaxonomyNode = (path) => {
  const ids = taxonomyIds(path);
  let nodes = window.POWER_TAXONOMY;
  let node = null;
  for (const id of ids) {
    node = nodes.find((item) => item.id === id) || null;
    if (!node) return null;
    nodes = node.children || [];
  }
  return node;
};

window.isTaxonomyDescendant = (path, ancestorPath) => {
  const ids = taxonomyIds(path);
  const ancestors = taxonomyIds(ancestorPath);
  return ancestors.length > 0 && ancestors.every((id, index) => ids[index] === id);
};

window.getTaxonomyLabels = (path) => {
  const ids = taxonomyIds(path);
  return ids.map((_, index) => window.findTaxonomyNode(ids.slice(0, index + 1))?.label).filter(Boolean);
};
