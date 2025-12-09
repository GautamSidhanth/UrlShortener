import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';

const HomePage = lazy(() => import('./page/HomePage'));
const UrlPage = lazy(() => import('./page/UrlPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ':shortenUrlKey', element: <UrlPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
]);

export default router;