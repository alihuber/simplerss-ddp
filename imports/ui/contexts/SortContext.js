import React from 'react';

const SortContext = React.createContext({
  sort: 1,
  setSort: () => { },
});

export default SortContext;
