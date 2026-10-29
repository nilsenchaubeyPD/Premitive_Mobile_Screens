import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PrototypePanel } from './components/PrototypePanel';
import { actions } from './lib/store';
import Config from './screens/admin/Config';
import Publish from './screens/admin/Publish';
import ViewAssessment from './screens/admin/ViewAssessment';
import CandidateRoute from './screens/candidate/CandidateRoute';
import Closed from './screens/candidate/Closed';
import Invigilator from './screens/invigilator/Invigilator';
import Report from './screens/reviewer/Report';
import TerrainPage from './screens/TerrainPage';

/** Cross-cutting state can also be set by query: ?exit=custom|rotating, ?offline=1|0, ?submitted=1|0, ?legacy=1|0 */
function useQueryToggles() {
  const { search } = useLocation();
  useEffect(() => {
    const q = new URLSearchParams(search);
    const exit = q.get('exit');
    if (exit === 'custom' || exit === 'rotating') actions.setExitType(exit);
    if (q.has('offline')) actions.setOffline(q.get('offline') === '1');
    if (q.has('submitted')) actions.setSubmitted(q.get('submitted') === '1');
    if (q.has('legacy')) actions.setLegacy(q.get('legacy') === '1');
  }, [search]);
}

export default function App() {
  useQueryToggles();
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/candidate/login" replace />} />
        <Route path="/admin/config" element={<Navigate to="/admin/config/rotating" replace />} />
        <Route path="/admin/config/:type/:variant?" element={<Config />} />
        <Route path="/admin/publish" element={<Publish />} />
        <Route path="/admin/view" element={<Navigate to="/admin/view/in-progress" replace />} />
        <Route path="/admin/view/:status" element={<ViewAssessment />} />
        <Route path="/invigilator/:phase?/:mode?" element={<Invigilator />} />
        <Route path="/candidate/closed" element={<Closed />} />
        <Route path="/candidate/:screen/*" element={<CandidateRoute />} />
        <Route path="/candidate" element={<Navigate to="/candidate/login" replace />} />
        <Route path="/reviewer/report" element={<Report />} />
        <Route path="/terrain" element={<TerrainPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PrototypePanel />
    </>
  );
}
