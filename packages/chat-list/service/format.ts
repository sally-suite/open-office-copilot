

export const search = (input: string) => {
  if (input === '/format') {
    return [
      {
        action: '/format',
        code: '/format',
        name: 'Format Table',
        weight: 1,
      },
    ];
  }
  if (/format/.test(input)) {
    return [
      {
        action: '/format',
        code: '/format',
        name: 'Format Table',
        weight: 0,
      },
    ];
  }
  return [];
};
