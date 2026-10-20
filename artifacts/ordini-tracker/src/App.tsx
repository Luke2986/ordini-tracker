import { Dashboard } from '@/components/Dashboard';
import ordiniData from '@/data/ordini.json';
import type { OrdiniDataset } from '@/data/types';

const dataset = ordiniData as OrdiniDataset;

export default function App() {
  return <Dashboard dataset={dataset} />;
}
