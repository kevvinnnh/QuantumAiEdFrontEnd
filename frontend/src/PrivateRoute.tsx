// // src/PrivateRoute.tsx
// import React from 'react';
// import { Route, Navigate } from 'react-router-dom';

// const PrivateRoute = ({ element: Element, ...rest }: any) => {
//   const isAuthenticated = /* logic to check if user is authenticated */;

//   return isAuthenticated ? (
//     <Route {...rest} element={<Element />} />
//   ) : (
//     <Navigate to="/" />
//   );
// };

// export default PrivateRoute;
