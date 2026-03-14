import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Executions from './pages/Executions';
import ExecutionDetail from './pages/ExecutionDetail';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workflows/new" element={<Editor />} />
        <Route path="/workflows/:id" element={<Editor />} />
        <Route path="/executions" element={<Executions />} />
        <Route path="/executions/:id" element={<ExecutionDetail />} />
      </Routes>
    </Layout>
  );
}
