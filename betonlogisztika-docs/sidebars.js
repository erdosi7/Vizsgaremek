const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Adatbázis',
      collapsed: false,
      items: [
        'adatbazis',
        'er-modell',
      ],
    },
    {
      type: 'category',
      label: 'Backend',
      collapsed: true,
      items: [
        'backend/mvc',
        'backend/models',
        'backend/controllers',
        'backend/routes',
        'backend/tests',
        'backend/middleware',
        'backend/config',
        'backend/node_modules',
        'backend/utils',
        'backend/app',
        'backend/server',
      ],
    },
    {
      type: 'category',
      label: 'Frontend',
      collapsed: true,
      items: [
        'frontend/bejelentkezes',
        'frontend/regisztracio',
        'frontend/fooldal',
        'frontend/ajanlatkeres',
        'frontend/megrendeles',
        'frontend/kapcsolat',
        'frontend/partnereink',
        'frontend/jogi-oldalak',
        'frontend/ajanlataim',
        'frontend/megrendeleim',
        'frontend/admin',
      ],
    },
    {
      type: 'category',
      label: 'Tesztelés',
      collapsed: true,
      items: [
        'teszteles/backend-tesztek',
        'teszteles/selenium-tesztek',
      ],
    },
    'reflektalas',
    'felhasznalt-programok',
  ],
};

module.exports = sidebars;