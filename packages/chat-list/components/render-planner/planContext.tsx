
import React, { createContext, useEffect, useState } from 'react';
import { IPlan } from 'chat-list/types/user';
import userApi from '@api/user';

interface IPlanContextState {
  plans: IPlan[];
  loading: boolean;
  plan: IPlan;
  loadPlans: () => void;
  addPlan: (plan: IPlan) => void;
  removePlan: (id: string) => void;
  getPlan: (id: string) => Promise<IPlan>;
}

const PlanContext = createContext<IPlanContextState>(null);

const PlanProvider = ({ children }: any) => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [plan, setPlan] = useState(null)
  const loadPlans = async () => {
    // setLoading(true);
    const list = await userApi.getPlanList();
    setPlans(list);
    // setLoading(true);
  }
  const getPlan = async (id: string) => {
    // setLoading(true);
    const plan = await userApi.getPlan(id);
    return plan;
    // setLoading(true);
  }
  const addPlan = async (plan: IPlan) => {
    await userApi.addPlan({
      name: plan.name,
      tasks: plan.tasks
    });
    await loadPlans();
  }
  const removePlan = async (id: string) => {
    await userApi.removePlan(id);
    await loadPlans();
  }
  useEffect(() => {
    loadPlans();
  }, [])

  useEffect(() => {
    console.log('first')
  }, [])

  return (
    <PlanContext.Provider value={{
      loading,
      plans,
      plan,
      loadPlans,
      addPlan,
      removePlan,
      getPlan
    }}>
      {children}
    </PlanContext.Provider>
  );
};

export { PlanContext, PlanProvider };
