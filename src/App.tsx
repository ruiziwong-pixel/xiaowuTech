import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { MainLayout } from './layouts/MainLayout';
import OverviewPage from './pages/overview';
import StoreHealthPage from './pages/store-health';
import AsinLifecyclePage from './pages/asin-lifecycle';
import AdDiagnosisPage from './pages/ad-diagnosis';
import InventoryHealthPage from './pages/inventory-health';
import TodoPage from './pages/todo';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 4,
          fontSize: 13,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/store-health" element={<StoreHealthPage />} />
            <Route path="/asin-lifecycle" element={<AsinLifecyclePage />} />
            <Route path="/ad-diagnosis" element={<AdDiagnosisPage />} />
            <Route path="/inventory-health" element={<InventoryHealthPage />} />
            <Route path="/todo" element={<TodoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
