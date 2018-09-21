import React, { Fragment } from 'react';

import Diargam from '../Diagram';

require("storm-react-diagrams/dist/style.min.css");
require("../../style.scss");

const App = () => {
  return (
    <Fragment>
      <Diargam />
    </Fragment>
  );
}

export default App;
