import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { usePlanStore } from '../store/usePlanStore';

export default function Wizard() {
  const { planId } = useParams();
  const setPlanId = usePlanStore((s) => s.setPlanId);

  useEffect(() => {
    if (planId) setPlanId(planId);
  }, [planId, setPlanId]);

  return <Navigate to="/" replace />;
}
